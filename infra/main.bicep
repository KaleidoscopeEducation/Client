param location string = resourceGroup().location
param acrName    string = 'kaleidoscopeaieducation-ajfgb4ceepedbyc5'
param imageTag   string          // passed from GitHub action

var acrLogin = '${acrName}.azurecr.io'
var logName  = 'law-librechat'
var envName  = 'cae-librechat'
var appName  = 'libreclient'

resource logs 'Microsoft.OperationalInsights/workspaces@2023-04-01' = {
  name: logName
  location: location
  sku: { name: 'PerGB2018' }
}

resource env 'Microsoft.App/managedEnvironments@2025-01-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
  identity: { type: 'SystemAssigned' }
}

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
          identity: 'SystemAssigned'        // ACA pulls with its own MSI
        }
      ]
      secrets: [
        { name: 'MONGO_URI',        value: '<your-mongo-conn-string>' }
        { name: 'OPENAI_API_KEY',   value: '<openai-key>' }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${acrLogin}/librechat:${imageTag}'
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
            http: { concurrentRequests: 10 }
          }
        ]
      }
    }
  }
}
