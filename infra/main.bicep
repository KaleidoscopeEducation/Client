// ──────────────────────────────────────────────────────────────
// LibreChat on Azure Container Apps (single-container version)
// ──────────────────────────────────────────────────────────────

// ========== Parameters ==========
@description('Azure region where all resources will be created')
param location string = resourceGroup().location   // e.g. "norwayeast"

@description('Short ACR resource name ( **without** ".azurecr.io" )')
param acrName string                              // e.g. "kaleidoscopeaieducation-ajfgb4ceepedbyc5"

@description('Repository part of the image, e.g. "<acr>.azurecr.io/libreclient"')
param imageRepo string

@description('Tag pushed by the workflow (Git SHA)')
param imageTag string

@secure()
@description('Mongo connection string')
param mongoUri string

@secure()
@description('OpenAI API key (or Azure OpenAI key)')
param openaiApiKey string


// ========== Reusable names ==========
var acrLoginServer = '${acrName}.azurecr.io'
var logAnalyticsName = 'law-librechat'
var acaEnvName       = 'env-librechat'
var acaAppName       = 'libreclient'


// ========== Log Analytics ==========
resource logWs 'Microsoft.OperationalInsights/workspaces@2023-04-01' = {
  name:  logAnalyticsName
  location: location
  sku: {
    name: 'PerGB2018'
  }
}

// ========== ACA Managed Environment ==========
resource env 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: acaEnvName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId:  logWs.properties.customerId
        sharedKey:   logWs.listKeys().primarySharedKey
      }
    }
  }
}

// ========== LibreChat Container App ==========
resource app 'Microsoft.App/containerApps@2025-02-02-preview' = {
  name: acaAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: env.id

    configuration: {
      ingress: {
        external: true
        targetPort: 3000
      }
      registries: [
        {
          server:   acrLoginServer
          identity: 'SystemAssigned'     // ACA pulls with its own MSI
        }
      ]
      secrets: [
        {
          name:  'MONGO_URI'
          value: mongoUri
        }
        {
          name:  'OPENAI_API_KEY'
          value: openaiApiKey
        }
      ]
    }

    template: {
      containers: [
        {
          name:  'web'
          image: '${imageRepo}:${imageTag}'
          env: [
            { name: 'MONGO_URI',      secretRef: 'MONGO_URI'      }
            { name: 'OPENAI_API_KEY', secretRef: 'OPENAI_API_KEY' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-load'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

// ========== Outputs ==========
output containerAppUrl string = app.properties.configuration.ingress.fqdn
