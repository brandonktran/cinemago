require('dotenv/config');
const express = require('express');
const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');
const fetch = require('node-fetch');
const promise = require('promise');

const app = express();

const apiKey = '9dbf824ef684a8b724b9b0e090bb97d9';

// bottom four constants are used in image uploading for user profile
const path = require('path');
const multer = require('multer');
const upload = multer({
  dest: path.join(__dirname, 'public/images/user-images/')
  //, limits: { fileSize: 2 * 1000 * 1000 } // image upload limit for 2MB
});
const fs = require('fs');

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

app.post('/api/search', (req, res, next) => {

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${req.body.query}&page=1&include_adult=false`)
    .then(result => result.json()
    )
    .then(data => {

      return res.json(data.results);
    })
    .catch(error => next(error));

});

// post request for search by genre
app.post('/api/search/genre', (req, res, next) => {
  // when the query results returned from the api
  // filter through (maxPage) of results returned until maxPage is reached or results reach 20
  // page limit(maxPages) is in place to prevent long load times
  const results = [];
  const filter = req.body.filter;
  var page = 0; // page increments before fetch is called, so it starts at 1
  let maxPage;
  if (!req.body.filter) {
    throw (new ClientError('filter is needed in request body', 400));
  } else {
    lookAtPages();
  }
  // recursive function is used when there aren't enough results and when page limit isn't met
  function lookAtPages() {
    page++;
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${req.body.query}&page=${page}&include_adult=false`)
      .then(result => result.json()
      )
      .then(data => {
        if (maxPage === undefined) { // decide the max number of pages to search through
          if (data.total_pages <= 14) {
            maxPage = data.total_pages;
          } else {
            maxPage = 14;
          }
        }
        for (let i = 0; i < data.results.length; i++) {
          const movie = data.results[i];
          const movieGenres = movie.genre_ids;
          let flag = false;
          for (let x = 0; x < filter.length; x++) {
            if (!movieGenres.includes(filter[x])) {
              flag = true;
            }
          }
          if (flag) {
            continue;
          } else {
            results.push(data.results[i]);
          }
        }
        if (results.length < 20 && page < maxPage) {
          lookAtPages();
        } else {
          return res.json(results);
        }
      })
      .catch(error => next(error));
  }
});
/* get request for api/details endpoint
notes: need to include name to reviews too. grab it from users table using userId?
*/
app.get('/api/details/:movieId', (req, res, next) => {
  const movieId = req.params.movieId;

  promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&language=en-US&page=1`)
      .then(res => res.json()),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
      .then(res => res.json()),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=1`)
      .then(res => res.json()),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`)
      .then(res => res.json())
  ])
    .then(data => {
      const sql = `
        select "rating", "content", "name" as "author"
        from "reviews"
        join "users" using ("userId")
        where "movieId" = $1
      `;

      const params = [movieId];
      db.query(sql, params)
        .then(result => {
          const review = result.rows;
          if (!review || !Array.isArray(review)) {
            return [];
          } else {
            return review;
          }
        }).then(data2 => {
          data[0].results = [...data2, ...data[0].results];
          res.json(data);
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));

});
// end feature: user-can-view-details

// POST request for home page to get trending or top rated movies
app.post('/api/home', (req, res, next) => {
  if (req.body.category === 'trending') {
    fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`)
      .then(result => result.json()
      )
      .then(data => res.json(data.results))
      .catch(err => next(err));
  } else {
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`)
      .then(result => result.json()
      )
      .then(data => res.json(data.results))
      .catch(err => next(err));
  }
});

// GET request to get user details
app.get('/api/users/:userId', (req, res, next) => {
  const id = req.params.userId;
  const sql = `
    select "userId",
      "name",
      "bio",
      "imageURL"
      from "users"
    where "userId" = $1
  `;
  const params = [id];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError(`user ${id} not found `, 404));
      } else {
        res.json(result.rows[0]);
      }
    })
    .catch(err => next(err));
});

// PATCH request to update user details
app.patch('/api/users/:userId', (req, res, next) => {
  const id = req.params.userId;
  if (!req.body.bio) {
    throw (new ClientError('bio is needed', 400));
  }
  const sql = `
    update "users"
    set "bio" = $2
    where "userId" = $1
  `;
  const params = [id, req.body.bio];
  db.query(sql, params)
    .then(result => res.sendStatus(200))
    .catch(err => next(err));
});

// upload user image and updates the imageurl to the user's data entry
app.post('/api/users/image/:userId', upload.single('image'), (req, res, next) => {
  // image refers to the name of the file-input on user-profile
  const userId = req.params.userId;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `public/images/user-images/${req.file.originalname}`);

  fs.rename(tempPath, targetPath, err => {
    if (err) throw (new ClientError('fs error', 500));
  });
  // after the file is created send target path to sql
  const sql = `
      update "users"
      set "imageURL" = $2
      where "userId" = $1
      `;
  const imageURL = `../images/user-images/${req.file.originalname}`;
  const params = [userId, imageURL];
  db.query(sql, params)
    .then(result => res.status(201).json({ imageURL: imageURL }))
    .catch(err => next(err));

});

// Reviews Table: Post, Get, Patch, and Delete Method Routes

//  Post method route for the endpoint at /api/reviews
app.post('/api/reviews', (request, response, next) => {

  //  Assign the value of the movieId property of the body property of
  //  the request object to a constant named movieId
  const movieId = request.body.movieId;

  //  Assign the value of the userId property of the body property of
  //  the request object to a constant named userId
  const userId = request.body.userId;

  //  Assign the value of the rating property of the body property of
  //  the request object to a constant named rating
  const rating = request.body.rating;

  //  Assign the value of the content property of the body property of
  //  the request object to a constant named content
  const content = request.body.content;

  //  Assign the value of the title property of the body property of
  //  the request object to a constant named title
  const title = request.body.title;

  //  If the value assigned to the constant named movieId is less than 1 or NaN
  if (movieId < 1 || isNaN(movieId)) {
    // Send an object as a JSON response with HTTP status code 400
    response.status(400).json({ error: 'invalid id' });
    return;
  }

  //  If the value of the constant named userId is falsy, the value of the constant
  //  named rating is less than 0, or value of the constant named content is falsy
  if (!userId || rating < 0 || !content) {
    //  Send an object as a JSON response with HTTP status code 400
    response.status(400).json({ error: 'missing content' });
    return;
  }

  //  Assign a template literal to a constant named sqlStatement
  const sqlStatement = `
    insert into "reviews" ("userId", "rating", "content", "movieId", "title" )
      values ($1, $2, $3, $4, $5)
    returning *;
  `;

  // Assign an array of five variables to a constant named parameters
  const parameters = [userId, rating, content, movieId, title];

  //  Call the query method on the db object passing in two arguments:
  //  a constant named sqlStatement and a constant named parameters
  db.query(sqlStatement, parameters)
  //  If the promise is fulfilled, then invoke the callback function
    .then(promiseResult => {
      //  If the first index of the rows property of the promise result is falsy
      if (!promiseResult.rows[0]) {
        //
        next(new ClientError('no reviews in table'), 404);
      } else { //  Otherwise
        //  Pass the value stored in the first row of the reviews table
        //  as a JSON response with HTTP status code 201 in the header
        response.status(201).json(promiseResult.rows[0]);
      }
    })
    //  If a promise is rejected
    .catch(error => {
      // Write the error to the console and
      console.error(error);
      // Send an object as a JSON response with HTTP status code 500
      response.status(500).json({ error: 'an unexpected error occurred' });
    });
}); // End of post method route for endpoint at /api/reviews

//  Get method route for endpoint at /api/review/:userId
app.get('/api/reviews/:userId', (request, response, next) => {

  //  Assign the value of the userId property of the params property of
  //  the request object to a constant named userId
  const userId = request.params.userId;

  // Assign a template literal to a constant named sqlStatement
  const sqlStatement = `
  select *
    from "reviews"
    where "userId" = $1
  `;

  //  Assign an array literal with one element to a constant named parameters
  const parameters = [userId];

  //  Call the query method of the db object passing in two arguments:
  //  a constant named sqlStatement and a constant named parameters
  db.query(sqlStatement, parameters)
    //  If the promise is fulfilled, then invoke the callback function
    .then(promiseResult => {
      //  If the first index of the rows property of the promise result is falsy
      if (!promiseResult.rows[0]) {
        //
        next(new ClientError('no reviews in table'), 404);
      } else { //  Otherwise
        //  Send the rows property of the promiseResult object as a JSON
        //  response with HTTP status code 200
        response.status(200).json(promiseResult.rows);
      }
    })
    //  If a promise is rejected
    .catch(err => {
      //  Write an error message to the console
      console.error(err);
      //  Send an object as a JSON response with HTTP status code 500
      response.status(500).json({ error: 'an unexpected error occurred' });
    });
}); // End of get method route for endpoint at /api/reviews/:userId

//  Patch method route for endpoint at /api/reviews/:reviewId
app.patch('/api/reviews/:reviewId', (request, response, next) => {

  //  Assign the value assigned to the reviewId property of the params property
  //  of the request object to a constant named reviewId
  const reviewId = request.params.reviewId;

  //  Assign the value assigned to the rating property of the body property
  //  of the request object to a constant named rating
  const rating = request.body.rating;

  //  Assign the value assigned to the content property of the body property
  //  of the request object to a constant named content
  const content = request.body.content;

  //  If the value of the constant named reviewId is less than 1 or is NaN
  if (reviewId < 1 || isNaN(reviewId)) {
    //  Send a JSON object as a response with HTTP status code 400
    response.status(400).json({ error: 'invalid review id' });
    return;
  }

  //  If the value of the constant named rating or content is falsy
  if (!rating || !content) {
    //  Send a JSON object as a response with HTTP status code 400
    response.status(400).json({ error: 'missing required information' });
    return;
  }

  //  Assign a template literal to a constant named sqlStatement
  const sqlStatement = `
    update "reviews"
      set "rating" = $1, "content" = $2
      where "reviewId" = $3
    returning *
  `;

  //  Assign an array literal with three elements to a constant named parameters
  const parameters = [rating, content, reviewId];

  //  Call the query method of the db object passing in two arguments:
  //  a constant named sqlStatement and a constant named parameters
  db.query(sqlStatement, parameters)
  //  If the promise is fulfilled, then invoke the callback function
    .then(promiseResult => {
      //  If the first index of the rows property of the promise result is falsy
      if (!promiseResult.rows[0]) {
        //
        next(new ClientError('no reviews in table'), 404);
      } else { //  Otherwise
      //  Send the promiseResult object as a JSON response with
      //  HTTP status code 200
        response.status(200).json(promiseResult);
      }
    })
    //  If a promise is rejected
    .catch(err => {
      // Write the error to the console and
      console.error(err);
      // Send an object as a JSON response with HTTP status code 500
      response.status(500).json({ error: 'an unexpected error occurred' });
    });
}); // End of patch method route for endpoint at /api/reviews/:reviewId

//  Delete method route for endpoint at /api/reviews/:reviewId
app.delete('/api/reviews/:reviewId', (request, response, next) => {

  //  Assign the value assigned to the reviewId property of the params property
  //  of the request object to a constant named reviewId
  const reviewId = request.params.reviewId;

  //  Assign a template literal to a constant named sqlStatement
  const sqlStatement = `
    delete from "reviews"
      where "reviewId" = $1
    returning *
  `;

  // Assign an array literal with one element to a constant named parameters
  const parameters = [reviewId];

  //  Call the query method of the db object passing in two arguments:
  //  a constant named sqlStatement and a constant named parameters
  db.query(sqlStatement, parameters)
  //  If the promise is fulfilled, invoke the callback function
    .then(promiseResult => {
      //  If the first index of the rows property of the promise result is falsy
      if (!promiseResult.rows[0]) {
        //
        next(new ClientError('no reviews in table'), 404);
      } else { //  Otherwise
        //  Send the rows property of the promiseResult object as a JSON
        //  response with HTTP status code 200
        response.status(200).json(promiseResult.rows);
      }
    })
    //  If a promise is rejected
    .catch(err => {
      // Write the error to the console and
      console.error(err);
      // Send an object as a JSON response with HTTP status code 500
      response.status(500).json({ error: 'an unexpected error occurred' });
    });
}); // End of delete method route for endpoint at /api/reviews/:reviewId

app.get('/api/lists/:userId', (req, res, next) => {
  const id = req.params.userId;
  const sql = `
    select *
      from "lists"
    where "userId" = $1
  `;
  const params = [id];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// DELETE request to delete a list
app.delete('/api/lists/:listId', (req, res, next) => {
  const id = req.params.listId;
  const sql = `
      delete from "lists" where "listId" = $1
      returning *
  `;
  const params = [id];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// POST request to create a new list
app.post('/api/lists/:userId', (req, res, next) => {
  const id = req.params.userId;
  const name = req.body.name;
  const sql = `
    insert into "lists" ("userId", "type","name")
    values ($1, 'custom', $2)
    returning *
  `;
  const params = [id, name];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// POST request to add a movie to a list
app.post('/api/lists/add/:listId', (req, res, next) => {
  const id = req.params.listId;
  const movieId = req.body.movieId;
  const title = req.body.title;
  const description = req.body.description;
  const posterURL = req.body.posterURL;
  const releaseDate = req.body.release_date;
  const sql1 = `select * from "listItems"
  where "listId" = $1 and "movieId" = $2`;

  const sql2 = `
  insert into "listItems"("listId", "movieId")
  values($1, $2)
  returning *
    `;

  const sql3 = `select * from "movies"
  where "movieId" = $1`;

  const sql4 = `insert into "movies" ("title", "movieId", "description", "posterURL", "reviews", "releaseDate")
  values($1, $2, $3, $4, $5, $6)
  returning * `;

  const params = [id, movieId];
  // checks if movie is already in that users list, if it isnt then add to list table
  db.query(sql1, params)
    .then(result => {
      if (result.rows.length < 1) {
        return db.query(sql2, params)
          .then(result2 => {
            if (result2.rows.length < 1) {
              next(new ClientError('some error occurred', 404));
            } else {
              // checks if movie is already in movies list, if it isnt then add to movies table
              return db.query(sql3, [movieId])
                .then(result3 => {
                  if (result3.rows.length < 1) {
                    db.query(sql4, [title, movieId, description, posterURL, { reviews: 'not yet' }, releaseDate])
                      .then(result4 => res.json(result4.rows));
                  } else {
                    next(new ClientError('movie already in movies table', 404));
                  }
                });
            }
          });
      } else {
        next(new ClientError('movie is already in users list ', 404));
      }
    })
    .catch(err => next(err));
});

// GET request to get all movies in a list
app.get('/api/listItems/:listId', (req, res, next) => {
  const id = req.params.listId;
  const sql = `
    select *
      from "listItems"
      join "movies" using ("movieId")
    where "listId" = $1
  `;
  const params = [id];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.delete('/api/listItems/:listId/:movieId', (req, res, next) => {
  const listId = req.params.listId;
  const movieId = req.params.movieId;
  const sql = `
    delete from "listItems"
    where "listId" = $1 and "movieId" = $2
    returning *
  `;
  const params = [listId, movieId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError('item not found to delete', 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// User can Login
app.post('/api/login/', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const value = [email, password];
  const sql = `
  select *
  from "users"
  where "email" = $1 and "password" = $2
  `;

  db.query(sql, value)
    .then(result => {
      const userInfo = result.rows[0];
      if (!userInfo) {
        res.json({ message: 'wrong email or password' });
      } else {
        req.session.userInfo = userInfo;
        return res.json(req.session);
      }
    })
    .catch(err => {
      return res.send({ message: err });
    });
});

// User can sign up
app.post('/api/signup/', (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const params = [email];
  const sql = `
    select *
    from "users"
    where "email" = $1
  `;
  const sql2 = `
    insert into "users" ("name", "email", "password")
         values ($1, $2, $3)
         returning *;
  `;

  const sql3 = `
  insert into "lists" ("userId", "type","name")
    values ($1, 'favorites', 'My Favorites List')`;
  const sql4 = `;
    insert into "lists" ("userId", "type","name")
    values ($1, 'watch', 'My Watch List')`;
  db.query(sql, params)
    .then(result => {
      const newUser = result.rows[0];
      if (newUser) {
        return res.status(400).json({
          error: 'email already taken'
        });
      } else {
        db.query(sql2, [name, email, password])
          .then(result => {
            const userInfo = result.rows[0];
            req.session.userInfo = userInfo;
            db.query(sql3, [userInfo.userId]).then(data => {
              db.query(sql4, [userInfo.userId]).then(data => {
                return res.json(req.session);
              });
            });
          });

      }
    })
    .catch(err => {
      return res.send({ message: err.message });
    });
});

// User can Log Out
app.post('/api/logOut/', (req, res, next) => {
  req.session.userInfo = null;
});

// get all other users besides userId (yourself)
app.get('/api/search/users/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const sql = `
    select "name", "bio", "email", "imageURL", "userId"
    from "users"
    where "userId" != $1
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        res.json([]);
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// get all messages where sentId is equal to userId
app.get('/api/messages/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const sql = `
    select "senderId", "content", "sentAt", "name", "messageId"
    from "messages"
    join "users" on "users"."userId" = "messages"."senderId"
    where "recipientId" = $1
  `;

  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError('no messages found', 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

// send a message from userId (sentId) to recipientId
app.post('/api/messages/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const recipientId = req.body.recipientId;
  const content = req.body.content;
  const sql = `
    insert into "messages" ("senderId", "recipientId", "content")
    values ($1, $2, $3)
    returning *
  `;
  const params = [userId, recipientId, content];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError('no messages found', 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

app.delete('/api/messages/:messageId', (req, res, next) => {
  const id = req.params.messageId;
  const sql = `
      delete from "messages" where "messageId" = $1
      returning *
  `;
  const params = [id];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length < 1) {
        next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => next(err));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});
