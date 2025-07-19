az containerapp exec \
  --resource-group main-container-repo \
  --name libreclient \
  --command "/bin/sh" |
npm run invite-user jgeorge0210+local1@gmail.com
