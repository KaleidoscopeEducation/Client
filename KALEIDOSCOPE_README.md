## README


# To Create new users from their email address:
- go to the scripts folder
- run "sh create_user.sh"   (no quotes)

# URL For the Live APP:

https://libreclient.bluedune-a4438afc.eastus.azurecontainerapps.io/c/new


# Create a new user:
- login to azure.portal.com as admin
- open console
- run commands:
```bash
az containerapp revision copy --name libreclient --resource-group libreclient-rg --cpu
az containerapp revision copy --name libreclient --resource-group libreclient-rg --cpu 0.5 --memory 1.0Gi
```