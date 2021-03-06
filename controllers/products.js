const pool = require('../db.js');


const productQuery = `SELECT products.id, name, slogan, description, category, default_price, json_agg(json_build_object('feature', feature, 'value', value)) features FROM products
INNER JOIN features ON products.id = features.product_id AND products.id = $1 GROUP BY products.id ORDER BY products.id`

const productStylesQuery = `
SELECT
	productId AS product_id,
	json_build_object('results',
						json_agg(json_build_object(
							'style_id', id,
							'name', name,
							'original_price', original_price,
							'sale_price', sale_price,
							'default?', default_style,
							'photos', (
								SELECT json_agg(
									json_build_object(
										'thumbnail_url', thumbnail_url,
										'url', url
									)
								)
								FROM photos
								WHERE photos.styleId = productstyles.id
								GROUP BY productstyles.id
							),
							'skus', (
								SELECT json_object_agg(skus.id, json_build_object(
									'quantity', quantity,
									'size', size
								)
								)
								FROM skus
								WHERE skus.styleId = productstyles.id
								GROUP BY productstyles.id
						  )
						 )
					   )
					 )
FROM
	productstyles
WHERE
	productId = $1
GROUP BY
	productId
ORDER BY
	productId
`

module.exports = {
  getProducts: (req, res) => {
    pool.query('SELECT id, name, slogan, description, category, default_price FROM products LIMIT 5', (err, results) => {
      if (err) {
        res.status(500)
        // throw err
      }
      console.log(results.rows)
      res.status(200).json([...results.rows])
    })
  },
  getProduct: (req, res) => {
    pool.query(productQuery, [req.params.id], (err, results) => {
    if (err) {
      res.status(500)
    }
    res.send(results.rows[0]);
  })
},

// getProductStyles: (req, res) => {
//   const dataObject = {
//     product_id: req.params.id,
//   }

//    pool.query('SELECT id AS style_id, name, original_price, sale_price, default_style AS "default?" FROM productstyles WHERE productstyles.productid = $1', [req.params.id], async (err, results) => {
//     if (err) {
//       throw err
//     }
//       const productStyleObject = await results.rows.map(async (style) => {
//       const photoQuery = await pool.query('SELECT url, thumbnail_url FROM photos WHERE photos.styleId = $1', [style.style_id])
//       const skusQuery = await pool.query('SELECT skus.id, skus.size, skus.quantity FROM skus WHERE skus.styleId = $1', [style.style_id])

//       if (style.sale_price == null) {
//         style.sale_price = "0"
//       }

//       if (style['default?'] === 1) {
//         style['default?'] = true
//       } else {
//         style['default'] = false
//       }


//       style.photos = photoQuery.rows
//       style.skus = {}
//       const skuObj = skusQuery.rows.map(({ id, size, quantity}) => {
//         return style.skus[id] = {
//           quantity,
//           size
//         }
//       })
//       return style;
//     })

//     Promise.all(productStyleObject).then((result) => {
//       dataObject['results'] = [...result]
//       res.send(dataObject)
//     })
//     })
// },
getProductStyles: (req, res) => {
   pool.query(productStylesQuery, [req.params.id], async (err, results) => {
    if (err) {
      res.status(500)
    }
    // console.log(results)
    if (results.rows.length === 0) {
      res.json({
        product_id: req.params.id,
        results: []
      })
    } else {

    res.json({
      product_id: results.rows[0].product_id,
      results: results.rows[0].json_build_object.results
    })
  }
})
},
  getRelatedProducts: (req, res) => {
    pool.query('SELECT related_product_id from related WHERE current_product_id = $1', [req.params.id], (err, results) => {
      if (err) {
        res.status(500)
      }
      const data = results.rows.map(({related_product_id}) => {
        if (related_product_id != 0) {
          return related_product_id
        }
      })
      res.send(data);
    })
  }
}