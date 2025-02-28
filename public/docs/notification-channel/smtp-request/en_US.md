# SMTP Configuration Guide

SMTP (Simple Mail Transfer Protocol) is a standard protocol for sending emails. By configuring SMTP, you can enable the system to automatically send notification emails to specified recipients.

## Basic Configuration

### Required Fields

* **Host**: SMTP server address, e.g., `smtp.example.com` or `smtp.gmail.com`
* **Port**: SMTP server port, common ports include:
  * 25: Standard SMTP port (unencrypted)
  * 465: SSL encrypted SMTP port
  * 587: TLS/STARTTLS encrypted SMTP port
* **Username**: SMTP server login username, typically your email address
* **Password**: SMTP server login password
* **From**: The sender's address shown in emails, format: `name@example.com` or `Display Name <name@example.com>`

### Optional Fields

* **Skip Verify**: Enable this option to verify the SMTP server's SSL/TLS certificate for enhanced security
* **Batch**: Maximum number of emails that can be sent simultaneously during notification to avoid delays or server rejection due to excessive sending.

## Common SMTP Service Provider Configurations

### NetEase Mail

* Server: `smtp.163.com`
* Port: 465
* Username: Your NetEase email address
* Password: Your NetEase email password

### Outlook/Office 365

* Server: `smtp.office365.com`
* Port: 587
* Username: Your Outlook email address
* Password: Your Outlook account password

### Alibaba Cloud Enterprise Email

* Server: `smtp.qiye.aliyun.com`
* Port: 465
* Username: Your enterprise email address
* Password: Your enterprise email password

## Troubleshooting

If you encounter issues while configuring SMTP, please check:

1. Whether the server address and port are correct
2. Whether the username and password are correct
3. Whether your SMTP service provider restricts third-party access (e.g., Gmail requires enabling "Less secure app access" or using app-specific passwords)
4. Whether your network environment allows access to the specified SMTP server and port

## Security Recommendations

1. Prefer using TLS/SSL encrypted connections (ports 587 or 465)
2. Use a dedicated email account for the system rather than personal email
3. Change SMTP password regularly
4. When possible, use app-specific passwords instead of master passwords
