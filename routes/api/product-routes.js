const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// https://localhost:3001/api/products

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          {
            model: Category,
          },
          {
            model: Tag,
            through: ProductTag,
          },
        ],
      });
  
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: [1, 2, 3, 4]
    }
  */
    console.log("Request Body: ", req.body); 
  try {
    // Create a new product using the provided data
    const product = await Product.create(req.body);

    if (req.body.tagIds.length) {
      console.log("TagIds: ", req.body.tagIds.length);
      // If there are associated tagIds, create pairings to bulk create in the ProductTag model
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }
    // If no associated tagIds, respond with the created product
    res.status(200).json(product);
  } catch (err) {
    // Log the error and respond with an error status
    console.log(err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const product = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });

    // Get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

    // Figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.json({ message: 'Product updated successfully' });

  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


  // delete one product by its `id` value
  router.delete('/:id', async (req, res) => {
    try {
      const deletedProduct = await Product.destroy({ where: { id: req.params.id } });
  
      if (!deletedProduct) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

module.exports = router;
