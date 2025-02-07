const ProductRepository = require("../database/repository/product-repository");
const { FormatData } = require("../utils/index");

class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs) {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormatData(productResult);
  }

  async GetProducts() {
    const products = await this.repository.Products();
    let categories = {};

    products.forEach(({ type }) => {
      categories[type] = type;
    });

    return FormatData({
      products,
      categories: Object.keys(categories),
    });
  }

  async UpdateProduct(productId, updatedData) {
    const updatedProduct = await this.repository.UpdateProduct(productId, updatedData);
    return FormatData(updatedProduct);
  }

  async GetProductsByCategory(category) {
    const products = await this.repository.FindByCategory(category);
    return FormatData(products);
  }

  async GetProductPayload(userId, { productId, amount }, event, isRemove, options = {}) {
    const product = await this.repository.FindById(productId);
    
    if (!product) {
      return FormatData({ error: "No product available" });
    }

    // Ensure sizes and colors exist, otherwise use defaults
    const sizes = options.sizes || product.sizes || [];
    const colors = options.colors || product.colors || [];

    const payload = {
      event,
      data: { userId, product: { ...product.toObject(), sizes, colors }, amount, isRemove },
    };

    return FormatData(payload);
  }

  async GetUpdatedProductPayload(productId, event) {
    const product = await this.repository.FindById(productId);

    if (!product) {
      return FormatData({ error: "No product available" });
    }

    const payload = {
      event,
      data: {
        productId,
        name: product.name,
        desc: product.desc,
        img: product.img,
        type: product.type,
        stock: product.stock,
        price: product.price,
        available: product.available,
      },
    };

    return FormatData(payload);
  }

  async reduceStock(data) {
    try {
      for (const item of data) {
        const product = await this.repository.FindById(item.productId);

        if (product) {
          product.stock -= item.productAmountBought;
          if (product.stock <= 0) {
            product.available = false;
          }
          await product.save();
        }
      }
    } catch (error) {
      console.error("Error reducing stock:", error);
    }
  }

  async SubscribeEvents(payload) {
    try {
      payload = JSON.parse(payload);
      const { event, data } = payload;

      switch (event) {
        case "REDUCE_PRODUCT_STOCK":
          await this.reduceStock(data);
          break;
      }
    } catch (error) {
      console.error("Error processing subscription event:", error);
    }
  }
}

module.exports = ProductService;
