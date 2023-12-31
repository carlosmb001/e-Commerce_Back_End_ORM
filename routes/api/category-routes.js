const router = require('express').Router();
const { Category, Product } = require('../../models');

// Get all categories with associated Products
// https://localhost:3001/api/categories/

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
        },
      ],
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

// Get a single category by its `id` value with associated Products
// https://localhost:3001/api/categories/#

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new category
// https://localhost:3001/api/categories/

router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update a category by its `id` value

// https://localhost:3001/api/categories/#

router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.update(
      { category_name: req.body.category_name },
      { where: { id: req.params.id } }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Delete a category by its `id` value
// https://localhost:3001/api/categories/#
router.delete('/:id', async (req, res) => {
  try {
     // First, delete or update all products associated with this category
    await Product.destroy({ where: { category_id: req.params.id } });
    
    // Now delete the category
    const deletedCategory = await Category.destroy({ where: { id: req.params.id } });

    if (!deletedCategory) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;
