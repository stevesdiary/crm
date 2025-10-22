resource "aws_s3_bucket" "main" {
  provider = aws.b2
  bucket   = "${var.environment}-crm-storage-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${var.environment}-crm-storage"
    Environment = var.environment
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}