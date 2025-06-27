// ──────────────────────────────────────────────────────────────
// LibreChat on Azure Container Apps (single-container version)
// ──────────────────────────────────────────────────────────────

// ========== Parameters ==========
@description('Azure region where all resources will be created')
param location string = resourceGroup().location   

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
// var acrLoginServer = '${acrName}.azurecr.io'
var logAnalyticsName = 'law-librechat'
var acaEnvName       = 'env-librechat'
var acaAppName       = 'libreclient'
var acrPullRoleId    = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var acrLoginServer = 'kaleidoscopeaieducation-ajfgb4ceepedbyc5.azurecr.io'
var shortAcrName = 'kaleidoscopeaieducation.azurecr.io'

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: acrName                                                                        
}

// ========== Log Analytics ==========
resource logWs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
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
  name: 'libreclient'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: env.id

    configuration: {
      ingress: {
        external: true
        targetPort: 3080
      }
      registries: [
        {
          server:   acrLoginServer
          identity: 'system'     // ACA pulls with its own MSI
        }
      ]
      secrets: [
        {
          name:  'mongo-uri'
          value: mongoUri
        }
        {
          name:  'openai-api-key'
          value: openaiApiKey
        }
      ]
    }

    template: {
      containers: [
        {
          name:  'web'
          image: '${acrLoginServer}:${imageTag}'
          env: [
            { name: 'MONGO_URI',      secretRef: 'mongo-uri'      }
            { name: 'OPENAI_API_KEY', secretRef: 'openai-api-key' }
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

resource acrPullRA 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(acr.id, acaAppName, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId:      app.identity.principalId
    principalType:    'ServicePrincipal'
  }
  dependsOn: [
    app
  ]
}

// ========== Outputs ==========
output containerAppUrl string = app.properties.configuration.ingress.fqdn
