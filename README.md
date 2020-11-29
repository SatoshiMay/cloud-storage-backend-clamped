# AWS Elastic Beanstalk deploy

# Specify instance profile using EB CLI (.ebextensions option does not work - gets overwritten by recommended values)
eb create --instance_profile aws-elasticbeanstalk-cloudstore-ec2-role

# Use eb deploy to assign correct tag and description to application on Elastic Beanstalk
eb deploy -l v0.5.1 -m `git rev-parse HEAD`
