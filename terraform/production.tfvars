environment = "production"
instance_count = 3
instance_type = "t3.medium"
database_instance_class = "db.t3.small"
alert_email = "alerts@company.com"
image_tag = "latest"

# Scaling configuration
min_capacity = 2
max_capacity = 10
target_cpu_utilization = 60

# Database configuration
database_allocated_storage = 100
database_backup_retention_period = 30
database_multi_az = true
database_encrypted = true

# Redis configuration
redis_node_type = "cache.t3.small"
redis_num_cache_nodes = 2
redis_at_rest_encryption_enabled = true
redis_transit_encryption_enabled = true

# S3 encryption
s3_encryption_enabled = true
s3_kms_key_id = "alias/aws/s3"