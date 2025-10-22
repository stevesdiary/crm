environment = "staging"
instance_count = 1
instance_type = "t3.small"
database_instance_class = "db.t3.micro"
alert_email = "alerts@company.com"
image_tag = "latest"

# Scaling configuration
min_capacity = 1
max_capacity = 3
target_cpu_utilization = 70

# Database configuration
database_allocated_storage = 20
database_backup_retention_period = 7
database_multi_az = false

# Redis configuration
redis_node_type = "cache.t3.micro"
redis_num_cache_nodes = 1