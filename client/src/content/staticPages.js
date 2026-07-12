const staticPages = {
    about: {
        title: 'About Us',
        content: [
            'Welcome to our online store. We are committed to offering quality products, fair pricing, and a smooth shopping experience from discovery to delivery.',
            'Our catalog is curated across categories with a focus on reliability, value, and customer satisfaction. Whether you are browsing for everyday essentials or something special, we aim to make shopping simple and enjoyable.',
            'Thank you for choosing us. We are continuously improving our product range, fulfillment process, and support experience for every customer.',
        ],
    },
    contact: {
        title: 'Contact Us',
        content: [
            'We are here to help with orders, product questions, and account support.',
            'For the fastest response, email our support team with your order number and a brief description of your request. You can also reach us using the contact details shown in the store footer.',
            'Our support hours are Monday to Saturday, 9:00 AM to 6:00 PM (IST). We aim to respond within one business day.',
        ],
    },
    faq: {
        title: 'Frequently Asked Questions',
        content: [
            {
                question: 'How do I place an order?',
                answer: 'Add products to your cart, proceed to checkout, enter your shipping details, and place your order. Guest checkout is available with a valid email address.',
            },
            {
                question: 'Can I track my order?',
                answer: 'Yes. Signed-in customers can view order status and details from the My Orders page after checkout.',
            },
            {
                question: 'What payment methods are supported?',
                answer: 'We currently support Cash on Delivery, UPI, and card payments where available. Online payment gateway integration may vary by store configuration.',
            },
            {
                question: 'How do returns work?',
                answer: 'Eligible orders can be submitted for return from the order details page. You can also review return request status from the My Returns page.',
            },
            {
                question: 'Do I need an account to shop?',
                answer: 'No. You can browse and checkout as a guest. Creating an account lets you save addresses, track orders, manage wishlists, and sync your cart across sessions.',
            },
        ],
    },
    terms: {
        title: 'Terms of Service',
        content: [
            'By using this store, you agree to these terms. Please read them carefully before placing an order.',
            'Product availability, pricing, and promotions may change without notice. We reserve the right to cancel orders affected by pricing errors, stock issues, or suspected fraud.',
            'You are responsible for providing accurate shipping and contact information. Orders are confirmed once you receive an order confirmation message or order number.',
            'These terms may be updated periodically. Continued use of the store after updates constitutes acceptance of the revised terms.',
        ],
    },
    privacy: {
        title: 'Privacy Policy',
        content: [
            'We collect information needed to process orders, provide support, and improve your shopping experience. This may include your name, email, phone number, shipping address, and order history.',
            'We use your data to fulfill orders, communicate order updates, prevent fraud, and comply with legal obligations. We do not sell your personal information to third parties.',
            'Account and session security is handled using industry-standard practices. You may update profile details from your account page when signed in.',
            'For privacy-related questions, contact us using the details provided on the Contact page.',
        ],
    },
};

export default staticPages;
