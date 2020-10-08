pod_name=$(kubectl get pod -l app=muminst-server -o jsonpath='{.items..metadata.name}')

for file in "$(pwd)/audio/*"
do
  echo "Uploading: $file"
  kubectl cp "$file" $pod_name:/app/audio
done
