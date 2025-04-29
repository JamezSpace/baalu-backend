export interface OrderRequest {
    customer: {
        email: string,
        firstName: string,
        lastName: string,
        phone: string
    };
    items: [
        {
            sku: string,
            name: string,
            quantity: number,
            unitPrice: number,
            totalPrice: number
        }
    ];
    shippingAddress: {
        name: string,
        street_address: string,
        city: string,
        state: string,
        zip_code: string,
        phone: string
    };
    shippingMethod: "standard" | "express";
    delivery_instructions: string;
}