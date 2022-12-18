INSERT INTO department (name)
VALUES
    ('Engineering'),
    ('Finance'),
    ('Sales'),
    ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Sales Lead', 180000, 3),
    ('Salesperson', 120000, 3),
    ('Lead Engineer', 170000, 1),
    ('Software Engineer', 140000, 1),
    ('Account Manager', 55000, 2),
    ('Accountant', 40000, 2),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Hugh', 'Cortez', 1, 1),
    ('Betty', 'Walters', 2, NULL),
    ('Valerie', 'Gonzalez', 3, 3),
    ('Ryan', 'Russell', 4, NULL),
    ('Julio', 'Jefferson', 5, 5),
    ('Jeannette', 'Steele', 6, NULL),
    ('Bethany', 'Murphy', 7, 7),
    ('Jeremy', 'Hale', 8, NULL);