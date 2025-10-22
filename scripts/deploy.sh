#!/bin/bash
set -e

ENV=${1:-staging}
IMAGE_TAG=${2:-latest}

echo "Deploying to $ENV environment with tag $IMAGE_TAG"

# Build and push Docker image
docker build -t crm-app:$IMAGE_TAG .
docker tag crm-app:$IMAGE_TAG ghcr.io/your-org/crm:$IMAGE_TAG
docker push ghcr.io/your-org/crm:$IMAGE_TAG

# Run database migrations
echo "Running database migrations..."
docker run --rm \
  -e DATABASE_URL=$DATABASE_URL \
  crm-app:$IMAGE_TAG \
  npx prisma migrate deploy

# Deploy to ECS
echo "Deploying to ECS..."
aws ecs update-service \
  --cluster crm-$ENV-cluster \
  --service crm-$ENV-service \
  --force-new-deployment

# Wait for deployment
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster crm-$ENV-cluster \
  --services crm-$ENV-service

echo "✓ Deployment complete!"
