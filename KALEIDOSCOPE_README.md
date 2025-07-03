## README

# Start in development mode:
- run `docker-compose up` in the root folder
- open http://localhost:3090 in your browser
- stop the LibreChat server in your docker for desktop app
- run npm ci in root folder
- run npm run frontend:dev in the root folder
- run npm run backend:dev in the root folder


# To Create new users from their email address:
- go to the scripts folder
- run "sh create_user.sh"   (no quotes)

# URL For the Live APP:

https://libreclient.bluedune-a4438afc.eastus.azurecontainerapps.io/c/new


# Create a new user:

- Log into azure.portal.com as the admin
- open a command prompt inside the portal, then do the following commands:

```bash
  az containerapp exec \
  --resource-group main-container-repo \
  --name libreclient \
  --command "/bin/sh"
```

# After waiting... THEN:

```bash
    npm run invite-user XXXX@gmail.com
```