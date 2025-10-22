# KMS Key for encryption
resource "aws_kms_key" "crm_key" {
  description             = "CRM application encryption key"
  deletion_window_in_days = 7

  tags = {
    Name        = "crm-encryption-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "crm_key_alias" {
  name          = "alias/crm-${var.environment}"
  target_key_id = aws_kms_key.crm_key.key_id
}

# Update RDS with encryption
resource "aws_db_instance" "crm_db" {
  identifier = "crm-db-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.database_instance_class
  
  allocated_storage     = var.database_allocated_storage
  max_allocated_storage = var.database_allocated_storage * 2
  
  db_name  = "crm"
  username = "crm_user"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.crm_db_subnet_group.name
  
  backup_retention_period = var.database_backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az               = var.database_multi_az
  publicly_accessible    = false
  
  # Encryption at rest
  storage_encrypted = var.database_encrypted
  kms_key_id       = aws_kms_key.crm_key.arn
  
  # Enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn
  
  # Performance Insights
  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.crm_key.arn
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Name        = "crm-db-${var.environment}"
    Environment = var.environment
  }
}

# Update ElastiCache with encryption
resource "aws_elasticache_replication_group" "crm_redis" {
  replication_group_id       = "crm-redis-${var.environment}"
  description                = "Redis cluster for CRM application"
  
  node_type            = var.redis_node_type
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = var.redis_num_cache_nodes
  
  # Encryption
  at_rest_encryption_enabled = var.redis_at_rest_encryption_enabled
  transit_encryption_enabled = var.redis_transit_encryption_enabled
  kms_key_id                 = aws_kms_key.crm_key.arn
  
  # Security
  security_group_ids = [aws_security_group.redis.id]
  subnet_group_name  = aws_elasticache_subnet_group.crm_redis_subnet_group.name
  
  # Backup
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Name        = "crm-redis-${var.environment}"
    Environment = var.environment
  }
}

# S3 bucket with encryption
resource "aws_s3_bucket" "crm_files" {
  bucket = "crm-files-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "crm-files-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_encryption_configuration" "crm_files_encryption" {
  bucket = aws_s3_bucket.crm_files.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.crm_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "crm_files_versioning" {
  bucket = aws_s3_bucket.crm_files.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "crm_files_pab" {
  bucket = aws_s3_bucket.crm_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}