source "$(pwd)/scripts/_shared.sh"

mkdir -p $GCLOUD_CREDENTIALS_FOLDER_PATH

echo "Creating service account $SERVICE_ACCOUNT_NAME.."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --description="Gives permission to plan and apply changes with terraform." \
    --display-name="$SERVICE_ACCOUNT_DISPLAY_NAME"

echo "Setting roles/container.admin into $SERVICE_ACCOUNT_NAME.."
gcloud projects add-iam-policy-binding $PROJECT_NAME \
    --member "serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_NAME.iam.gserviceaccount.com" \
    --role "roles/container.admin"

echo "Generating service account key for $SERVICE_ACCOUNT_NAME.."
gcloud iam service-accounts keys create $GOOGLE_APPLICATION_CREDENTIALS \
    --iam-account "$SERVICE_ACCOUNT_NAME@$PROJECT_NAME.iam.gserviceaccount.com"