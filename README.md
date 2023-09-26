# A Express, Prisma Crud Generator

### This package usage express-validator for validation


## Installation 

``` npm install npm-crud --save-dev ```

## Usage 

This package generates crud from a `schema.json`

### Sample `schema.json`

Please note schema.json

```
{
    "databaseType":"mysql" // "postgres",
    "relationShipMode":"prisma", // null
    "schemaFileLocation":"schema/prisma", // schema file location,
    "validationsDirectory":"src/validations",
    "controllersDirectory":"src/controllers",
    "servicesDirectory":"src/controllers",
    "dtosDirectory":"src/dtos",
    "tables":[
        {
            "name":"users", // table name
            "columns":[
                {
                    "name":"name",
                    "type":"string",
                    "validations":"required|max:255|min:200|string"
                },
                {
                    "name":"timestamps" // this will generate two fields , createdAt , updatedAt
                }
            ]
        },
        {
            "name":"userLogins",
            "columns":[
                {
                    "name":"userId",
                    "type":"Int",
                    "relationField":{
                        "type":"belongsTo",
                        "table":"users",
                        "isNull":false
                    }
                },
                {
                    "name":"token",
                    "type":"string",
                    "unique":true,
                    "validations":"required|max:255|min:200|string"
                }
            ]
        }
    ]
}
```
## Usage

> Basic Usage:

```node node_modules/npm-crud/src/index.js ```

> Alternate Usage:

#### You can add one simple script in package.json

```
{
   "scripts": {
    "generate:crud": "node node_modules/npm-crud/src/index.js"
  },
}
```

## Roadmap

[x] Handle Prisma Relations in the schema

[x] Handle Prisma Relations in the services as well
