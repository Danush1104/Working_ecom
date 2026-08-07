variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "ap-southeast-1"
}

variable "dashboard_name" {
  description = "The name of the CloudWatch dashboard"
  type        = string
  default     = "Danush-ECommerce-Dashboard"
}

variable "lambda_prefix" {
  description = "The prefix used for all microservice Lambda functions"
  type        = string
  default     = "Danush_"
}

variable "api_name" {
  description = "The API Gateway stage or API name used for filtering metrics"
  type        = string
  default     = "inv"
}
