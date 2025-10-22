output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
  sensitive   = true
}

output "s3_bucket" {
  description = "S3 bucket name"
  value       = module.s3.bucket_name
}