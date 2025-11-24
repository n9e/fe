Use this transformation to provide the flexibility to rename, reorder, or hide fields returned by a single query in your panel. This transformation is applicable only to panels with a single query. If your panel has multiple queries, consider using an "Join by field" transformation or removing extra queries.

## Transforming fields

Displays a list of fields returned by the query, allowing you to perform the following actions:

- Change field order - Hover over a field, and when your cursor turns into a hand, drag the field to its new position.
- Hide or show a field - Use the eye icon next to the field name to toggle the visibility of a specific field.
- Rename fields - Type a new name in the "Rename <field>" box to customize field names.

## Example:

### Original Query Result

| \_\_time            | ident      | cpu       | \_\_value |
| ------------------- | ---------- | --------- | --------- |
| 2025-07-01 09:01:00 | dev-n9e-01 | cpu-total | 81        |
| 2025-07-01 09:02:00 | dev-n9e-02 | cpu-total | 82        |
| 2025-07-01 09:03:00 | dev-n9e-03 | cpu-total | 83        |

### After Applying Field Overrides

| Time                | Ident      | Value |
| ------------------- | ---------- | ----- |
| 2025-07-01 09:01:00 | dev-n9e-01 | 81    |
| 2025-07-01 09:02:00 | dev-n9e-02 | 82    |
| 2025-07-01 09:03:00 | dev-n9e-03 | 83    |
