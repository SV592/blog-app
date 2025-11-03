---
title: SQL Command Differences
date: "2025-11-03"
description: Master subtle differences between similar SQL commands to write faster, clearer queries
tags: ["SQL", "Database", "Commands"]
image: "/blogImages/sql.jpg"
slug: sql-commands
---

# SQL Command Differences: Choosing the Right Tool

SQL has many commands that look similar but work differently. Knowing which to use makes your queries faster and cleaner.

## UNION vs UNION ALL

UNION combines result sets and removes duplicate rows. UNION ALL keeps all rows, including duplicates.
UNION ALL runs faster because it doesn't spend time removing duplicates. Use UNION when you need unique results. Use UNION ALL when speed matters or duplicates are fine.

```sql
SELECT name FROM employees
UNION
SELECT name FROM contractors;
```


## PRIMARY KEY vs UNIQUE

A PRIMARY KEY identifies each row uniquely. Only one PRIMARY KEY exists per table, and it cannot contain NULL values.
A UNIQUE constraint prevents duplicate values in a column. Multiple UNIQUE constraints can exist per table, and they can contain NULL values.
Foreign keys reference PRIMARY KEYS, not UNIQUE columns. Use PRIMARY KEY for the main identifier. Use UNIQUE for other fields that must be distinct, like email addresses.

```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100)
);
```



## WHERE vs HAVING

WHERE filters rows before grouping happens. HAVING filters groups after grouping and aggregation complete.

```sql
SELECT department, COUNT(*) as employee_count
FROM employees
WHERE salary > 50000
GROUP BY department;
```

You cannot use aggregate functions in WHERE clauses. Use aggregate functions with HAVING:

```sql
SELECT department, COUNT(*) as employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;
```

The order is: WHERE → GROUP BY → HAVING. Use WHERE to exclude source rows. Use HAVING to exclude grouped results.

## DELETE vs TRUNCATE vs DROP

DELETE removes specific rows based on conditions. You can roll back deletions and selectively remove records.

```sql
DELETE FROM products
WHERE discontinued = 1;
```

TRUNCATE empties an entire table instantly. It deallocates storage space and resets identity values. You cannot selectively remove rows with TRUNCATE.

```sql
TRUNCATE TABLE products;
```

DROP removes the entire table structure and all rows. This operation eliminates columns, constraints, and indexes.

```sql
DROP TABLE products;
```
- DELETE removes specific rows based on conditions. You can roll back deletions and selectively remove records. The operation runs slower because it processes rows one by one.

- TRUNCATE empties an entire table instantly without row-by-row processing. It deallocates storage space and resets identity values to their starting point. You cannot selectively remove rows with TRUNCATE, and rollback is typically not possible.

-  DROP removes the entire table structure along with all rows. This eliminates columns, constraints, and indexes completely. The operation executes quickly but cannot be undone in most databases.


## DISTINCT vs GROUP BY

DISTINCT returns unique combinations of specified columns:

```sql
SELECT DISTINCT department, job_title
FROM employees;
```

GROUP BY organizes rows into groups sharing identical values:

```sql
SELECT department, job_title, COUNT(*)
FROM employees
GROUP BY department, job_title;
```

DISTINCT answers "what unique values exist?" GROUP BY answers "what unique values exist, and what do we know about each group?" Use DISTINCT to remove duplicates. Use GROUP BY when computing statistics per group.

## LIKE vs =

The = operator matches exact values only. 'Smith' matches only 'Smith'.

```sql
SELECT * FROM customers WHERE last_name = 'Smith';
```

LIKE enables pattern matching with wildcards. % matches any sequence of characters. _ matches exactly one character.

```sql
SELECT * FROM customers WHERE last_name LIKE 'Sm%';
```

This retrieves Smith, Smythe, Smirnoff, and any name starting with 'Sm'. Use = for exact matching. Use LIKE for flexible or partial matching.


## Conclusion

These six comparisons appear constantly in real SQL work. Understanding each distinction makes your queries faster, prevents bugs, and builds better schemas. The most effective database developers aren't those who memorize commands—they're those who understand precisely when and why each command exists. Start applying these distinctions deliberately in your next query.


## References & Further Reading

- SQL Standard Documentation: [ISO/IEC 9075](https://en.wikipedia.org/wiki/SQL)
- MySQL Reference Manual: [SELECT Syntax](https://dev.mysql.com/doc/refman/8.0/en/select.html)
- PostgreSQL Documentation: [Data Manipulation](https://www.postgresql.org/docs/current/dml.html)
- Mode Analytics SQL Tutorial: [SQL Analytics](https://mode.com/sql-tutorial/)
- SQL Performance Tips: [Tips](https://use-the-index-luke.com/)