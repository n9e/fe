## Data Label Enrichment Documentation

The label enrichment feature automatically extracts business labels (e.g., environment, service name) from the tag lexicon (built based on AWS resource labels) using resource identifier fields in CloudWatch metrics. These labels are appended to raw metrics to enhance readability and filterability.

---

### Data Sample

Some time-series metrics in CloudWatch query results include resource identifier fields, such as:

```json
{ "InstanceId": "i-009e2d6affd17d345", "Series": "CPUUtilization" }
```

Meanwhile, in the AWS Console, the corresponding EC2 instance (i-009e2d6affd17d345) has the following labels configured in the Resource Tags tab:

```
env = prod
name = nginx-service
```

These labels are extracted by the system to build the tag lexicon for label enrichment.

---

### Configuration Guide

You can configure a field (e.g., InstanceId) as a matching key. The system will use this key to look up the resource's labels in the tag lexicon and append selected labels to the original metric.

Example configuration:

- Tag lexicon source: EC2 instance tag data
- Matching field (source label): `InstanceId`
- Labels to append: `env`, `name`

---

### Enrichment Results

Original metric data:

```json
{
  "InstanceId": "i-009e2d6affd17d345",
  "Series": "CPUUtilization"
}
```

After label enrichment:

```json
{
  "InstanceId": "i-009e2d6affd17d345",
  "Series": "CPUUtilization",
  "env": "prod",
  "name": "nginx-service"
}
```
