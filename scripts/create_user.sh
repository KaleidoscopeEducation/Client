# 1. Get an admin session cookie once
TOKEN=$(curl -sk \
  -H "Content-Type: application/json" \
  -d '{"email":"kaleidoscopeaieducation@gmail.com","password":"fuzzycanoe123"}' \
  https://libreclient.bluedune-a4438afc.eastus.azurecontainerapps.io/api/auth/login |
  jq -r '.token')

echo "TOKEN captured: ${TOKEN}…"

# 2. Use that cookie to invite a new user any time
curl -sk -X POST \
  -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
  -d '{"email":"ishiffman120@gmail.com","roles":["USER"]}' \
  https://libreclient.bluedune-a4438afc.eastus.azurecontainerapps.io/api/admin/users/invite




# exec into container app
  az containerapp exec \
  --resource-group main-container-repo \
  --name libreclient \
  --command "/bin/sh"


# run invite user script
npm run invite-user XXXX@gmail.com