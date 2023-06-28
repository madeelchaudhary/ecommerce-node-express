export function validateProduct(prod: null | undefined | {}) {
  if (!prod) {
    return {
      valid: false,
      message: "Product is Invalid",
    };
  }

  if (!("title" in prod)) {
    return {
      valid: false,
      message: "Please enter a valid title",
    };
  }
  if (!("image" in prod)) {
    return {
      valid: false,
      message: "Please enter a image",
    };
  }
  if (!("description" in prod)) {
    return {
      valid: false,
      message: "Please enter a Description",
    };
  }
  if (!("price" in prod)) {
    return {
      valid: false,
      message: "Please enter a Price",
    };
  }
  if (!("label" in prod)) {
    return {
      valid: false,
      message: "Please enter a Product label",
    };
  }
  if (!("category" in prod)) {
    return {
      valid: false,
      message: "Please enter a Product Category",
    };
  }

  return {
    valid: true,
    message: "Valid Details",
  };
}
