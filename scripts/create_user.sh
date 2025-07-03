az containerapp exec \
  --resource-group main-container-repo \
  --name libreclient \
  --command "/bin/sh" |
npm run invite-user XXXX@gmail.com
