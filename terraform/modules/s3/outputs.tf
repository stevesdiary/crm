output "bucket_name" {
  description = "B2 bucket name"
  value       = aws_s3_bucket.main.bucket
}

output "bucket_endpoint" {
  description = "B2 S3-compatible endpoint"
  value       = "https://s3.${var.b2_region}.backblazeb2.com"
}