# CRUDRoutes

A library for easily adding a REST API for CRUD on any Mongoose model. Supports Express and Koa routers. In the future, may support other data models and stores.


# Usage

## Local Dev

Getting started:
* Clone repo
* ```npm i```
* Either TDD using ```npm test```
* Or run local manual tests using ```npm start``` or ```npm run start:koa```


## Usage in an Express app
```js
const express = require('express');
const CRUDRoutes = require('CRUDRoutes');

const app = express();

const router = express.Router();

// insert your own routes here

CRUDRoutes(router, '/user', User);

// more routes here

app.use(router);
```

To-do: document Koa (it's pretty much exactly the same thing)

## Routes created
See [#REST API Standards]

## Optional middleware
Each route has a "before" and "after" hook. These are middleware functions, using either Express or Koa format, depending on your router.

Express example:
```CRUDRoutes(router, '/user', User, {
  beforeRemove: async (req, res, next) => {
    await UserArchive.insert(req.body);
    await next();
  },
  afterFind: async (req, res, next) => {
    res.result.data = res.result.data.map(d => d.isAdmin = d.roles.includes('admin'));
    await next();
  }
})
```

Koa example:
```CRUDRoutes(router, '/user', User, {
  beforeRemove: async (ctx, next) => {
    await UserArchive.insert(ctx.body);
    await next();
  },
  afterFind: async (ctx, next) => {
    ctx.res.result.data = ctx.res.result.data.map(d => d.isAdmin = d.roles.includes('admin'));
    await next();
  }
})
```

### Compatibility

In order to ensure compatibility between Express and Koa, data is persisted across a given request by storing it in either  the [native node.js http.ClientRequest](https://nodejs.org/api/http.html#http_class_http_clientrequest) or the [native node http.ServerResponse object](https://nodejs.org/api/http.html#http_class_http_serverresponse).
* In express, these are the base objects from which "req" and "res" are extended.
* In koa, these objects are available as ctx.req and ctx.res (as opposed to the koa-specific ctx.request and ctx.response)

Feel free to use express or koa-specific APIs in your custom middleware, if they aren't expecting this library to handle anything downstream. All internal middleware uses only the req and res objects, as express or koa-specific APIs would not be suitable for cross-framework compatibility.

Specifically:
* Params, query, and body are stored in req
* The library uses res.writeHead and res.end to send data, as opposed to res.send or ctx.status / ctx.body
* Query results are stored in res.result in the form:
  * data: Array or Object (required; contains the data that was found/created/removed/updated. In the case of upsertMany(), takes the form { inserted:[], updated:[] })
  * status: Number (optional; HTTP status code representing the result. If not present, assumes 200 if not handling an exception, 500 if exception)
  * filterCount: Number (only in find(); contains the total # of records that match the current filter, irrespective of pagination)
  * totalCount: Number (only in find(): contains the total # of records in the requested entity's collection, regardless of filters or pagination)
  * numAffected: Number (only in removeMany(): contains the # of records deleted);





# REST API Standards

This library obeys the following REST API standards:

## Standard Endpoints
All endpoints obey the following standard:

* Endpoint name is /:entityname (e.g. /workflow)
* Entity name is always singular
* Endpoints specific to a single entity follow the pattern /:entityname/:id
  * Example: /workflow/123
  * The id is always the \_id field (usually an ObjectId)

Basic endpoints for all entities:

### GET /:entityname
* Retrieves all entities (default limit is 50, can be customized, see below)
* Always returns an array of objects (regardless of count)
* Header "X-Filter-Count" contains the total # of records given your current filter set
* Header "X-Total-Count" contains the total # of records in the collection without filtering
* "fields" parameter is a comma-delimited list of fields to project (default: all). Ex: /product?fields=name,map_prices
* "limit" parameter acts like LIMIT in SQL, default 50
* "offset" parameter acts like OFFSET in SQL, default 0
* "q" parameter runs a text search if an index exists, or a regex match otherwise
* "sort" parameter is a comma delimited list of fields to sort on, with a - prefix for DESC. Ex: /listing?sort=list_price,-extracted_time is comparable to SELECT * FROM listing ORDER BY list_price ASC, extracted_time DESC
* Entity properties can be used as filters.
  * /product?name=Some%20Product is equivalent to SELECT * FROM product WHERE name = 'Some Product'
  * /listing?list_price=10-100 is equivalent to SELECT * FROM listing WHERE list_price >= 10 AND list_price <= 100
  * /violation?status=OPEN,RESOLVED is equivalent to SELECT * FROM violation WHERE status IN ('OPEN','RESOLVED')
* Filters can be regular expressions.
  * /product?name=/foo/ is equivalent to db.product.find({ name:/foo/ })

### GET /:entityname/:id
* Retrieves a single entity
* Always returns a single JSON object if found, or empty body if not found.

### POST /:entityname
* Creates a new entity
* Body must be a single JSON object and must contain all required fields (but not \_id)
* On success, returns the created entity (along with any auto-generated fields such as timestamps)

### PUT /:entityname/:id
* Updates a single entity
* Body must be a single JSON object. Include only fields you want to change; others are ignored. Do not include \_id.
* On success, returns the updated entity (along with any auto-generated fields such as timestamps)

### PUT /:entityname
* Upserts multiple entities
* Body must be an array of entities.
* Each entity you want to update, include only fields you want to change, and include the \_id field.
* Entities without and \_id field will be treated as inserts. Include all required fields, or the insert will fail.
* Returns an array of all entities inserted and updated, along with any auto-generated fields.

### DELETE /:entityname/:id
* Deletes a single entity
* No body required
* On success, returns mongo operation result

### DELETE /:entityname
* Deletes multiple entities
* Do not include a body
* Use the filter syntax for GET (described above)
* For example:
  * DELETE /api/product?name=Some%20Product%20Name will delete any products whose name field === 'Some Product Name'
  * DELETE /api/product?name=/Some/ will delete any products with "Some" in the name
  * DELETE /api/product?ccs_product_id.customerCatalogId=1,2,3 will delete any products whose ccs_product_id contains a customerCatalogId that is either 1, 2, or 3
* On success, returns number of documents deleted