// ──────────────────────────────────────────────────────────────
// LibreChat on Azure Container Apps (single-container version)
// ──────────────────────────────────────────────────────────────

// ========== Parameters ==========
@description('Azure region where all resources will be created')
param location string = resourceGroup().location

@description('Short ACR resource name ( **without** ".azurecr.io" )')
// param acrName string                              // e.g. "kaleidoscopeaieducation-ajfgb4ceepedbyc5"
param acrName string = 'kaleidoscopeaieducation'

@description('Repository part of the image, e.g. "<acr>.azurecr.io/libreclient"')
param imageRepo string

@description('Tag pushed by the workflow (Git SHA)')
param imageTag string

@secure()
@description('Mongo connection string')
param mongoUri string

@secure()
@description('API key for the assistants API')
param assistantsApiKey string

@secure()
@description('OpenAI API key (or Azure OpenAI key)')
param openaiApiKey string

@secure()
@description('Encryption key github secret')
param encryptionKey string

@secure()
@description('Credentials key for the client')
param credsKey string

@secure()
@description('Credentials IV for the client')
param credsIv string

@secure()
@description('JWT secret for the client')
param jwtSecret string

@secure()
@description('JWT refresh secret for the client')
param jwtRefreshSecret string

@secure()
@description('Email service username for the client')
param smtpUser string

@secure()
@description('Email service password for the client')
param smtpPass string

// ========== Reusable names ==========
// var acrLoginServer = '${acrName}.azurecr.io'
var logAnalyticsName = 'law-librechat'
var acaEnvName = 'env-librechat'
var acaAppName = 'libreclient'
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var acrLoginServer = 'kaleidoscopeaieducation-ajfgb4ceepedbyc5.azurecr.io'
var shortAcrName = 'kaleidoscopeaieducation.azurecr.io'

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: acrName
}

// ========== Log Analytics ==========
resource logWs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
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
        customerId: logWs.properties.customerId
        sharedKey: logWs.listKeys().primarySharedKey
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
          server: acrLoginServer
          identity: 'system' // ACA pulls with its own MSI
        }
      ]
      secrets: [
        {
          name: 'mongo-uri'
          value: mongoUri
        }
        {
          name: 'openai-api-key'
          value: openaiApiKey
        }
        { name: 'assistants-api-key', value: assistantsApiKey }
        {
          name: 'encryption-key'
          value: encryptionKey
        }
        { name: 'creds-key', value: credsKey }
        { name: 'creds-iv', value: credsIv }
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'jwt-refresh-secret', value: jwtRefreshSecret }
        { name: 'smtp-user', value: smtpUser }
        { name: 'smtp-pass', value: smtpPass }
      ]
    }

    template: {
      containers: [
        {
          name: 'web'
          image: '${acrLoginServer}/libreclient:${imageTag}'
          env: [
            { name: 'MONGO_URI', secretRef: 'mongo-uri' }
            { name: 'OPENAI_API_KEY', secretRef: 'openai-api-key' }
            { name: 'ASSISTANTS_API_KEY', secretRef: 'assistants-api-key' }
            { name: 'ENCRYPTION_KEY', secretRef: 'encryption-key' }
            { name: 'CREDS_KEY', secretRef: 'creds-key' }
            { name: 'CREDS_IV', secretRef: 'creds-iv' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'JWT_REFRESH_SECRET', secretRef: 'jwt-refresh-secret' }
            { name: 'EMAIL_USERNAME', secretRef: 'smtp-user' }
            { name: 'EMAIL_PASSWORD', secretRef: 'smtp-pass' }
            { name: 'MIGRATE_ROLES', value: 'true' }
            { name: 'ALLOW_EMAIL_LOGIN', value: 'true' }
            { name: 'ALLOW_REGISTRATION', value: 'false' }
            { name: 'SESSION_EXPIRY', value: '1000 * 60 * 120' }
            { name: 'REFRESH_TOKEN_EXPIRY', value: '1000 * 60 * 60 * 24 * 30' }
            { name: 'EMAIL_HOST', value: 'smtp.azurecomm.net' }
            { name: 'EMAIL_PORT', value: '587' }
            { name: 'ALLOW_SOCIAL_REGISTRATION', value: 'false' }
            { name: 'ALLOW_PASSWORD_RESET', value: 'true' }
            { name: 'ALLOW_UNVERIFIED_EMAIL_LOGIN', value: 'true' }
            { name: 'EMAIL_ENCRYPTION', value: 'starttls' }
            { name: 'EMAIL_FROM_NAME', value: 'Kaleidoscope' }
            { name: 'EMAIL_ALLOW_SELFSIGNED', value: 'true' }
            { name: 'EMAIL_FROM', value: 'DoNotReply@f90b75ff-585a-4c44-9a3d-6ec510f94137.azurecomm.net' }
            { name: 'APP_NAME', value: 'Kaleidoscope' }
            { name: 'APP_TITLE', value: 'Kaleidoscope' }
            { name: 'CUSTOM_FOOTER', value: 'Kaleidoscope 2025' }
            { name: 'HELP_AND_FAQ_URL', value: 'https://app.kaleidoscopeai.net/?stay=yes' }
            { name: 'DOMAIN_CLIENT', value: 'https://libreclient.bluedune-a4438afc.eastus.azurecontainerapps.io' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
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

// resource acrPullRA 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
//   name: guid(acr.id, acaAppName, 'AcrPull')
//   scope: acr
//   properties: {
//     roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
//     principalId:      app.identity.principalId
//     principalType:    'ServicePrincipal'
//   }
//   dependsOn: [
//     app
//   ]
// }

// ========== Outputs ==========
output containerAppUrl string = app.properties.configuration.ingress.fqdn
