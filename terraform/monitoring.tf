# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "crm_logs" {
  name              = "/ecs/crm-app"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Application = "crm"
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "crm-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.crm_service.name
    ClusterName = aws_ecs_cluster.crm_cluster.name
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "crm-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = aws_ecs_service.crm_service.name
    ClusterName = aws_ecs_cluster.crm_cluster.name
  }
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "crm-alerts"

  tags = {
    Environment = var.environment
    Application = "crm"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Application Load Balancer Target Group Health Check
resource "aws_lb_target_group" "crm_tg" {
  name     = "crm-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.crm_vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Environment = var.environment
    Application = "crm"
  }
}