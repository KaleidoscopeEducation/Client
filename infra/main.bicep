// ── PARAMETERS ────────────────────────────────────────────────────────────────
param location   string = resourceGroup().location
param acrName    string = 'kaleidoscopeaieducation-ajfgb4ceepedbyc5'
param imageRepo  string          // ✅ new – full repo, e.g. "…azurecr.io/libreclient"
param imageTag   string          // passed from the workflow

// ── CONSTANTS / VARS ─────────────────────────────────────────────────────────
var acrLogin = '${acrName}.azurecr.io'      // still useful for registry block
var logName  = 'law-librechat'
var envName  = 'cae-librechat'
var appName  = 'libreclient'

// ── LOG ANALYTICS ────────────────────────────────────────────────────────────
resource logs 'Microsoft.OperationalInsights/workspaces@2023-04-01' = { … }

// ── CONTAINER APPS ENV ───────────────────────────────────────────────────────
resource env  'Microsoft.App/managedEnvironments@2025-01-01' = { … }

// ── THE LIBRECHAT APP ────────────────────────────────────────────────────────
resource app 'Microsoft.App/containerApps@2025-02-02-preview' = {
  name: appName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
      }
      registries: [
        {
          server: acrLogin
          identity: 'SystemAssigned'
        }
      ]
      secrets: [
        { name: 'MONGO_URI',      value: '<your-mongo-conn-string>' }
        { name: 'OPENAI_API_KEY', value: '<openai-key>' }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${imageRepo}:${imageTag}'   // ✅ uses the new parameter
          env: [
            { name: 'MONGO_URI',      secretRef: 'MONGO_URI' }
            { name: 'OPENAI_API_KEY', secretRef: 'OPENAI_API_KEY' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http'
            http: {
              metadata: {                // ✅ new schema (2024-05+)
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}
