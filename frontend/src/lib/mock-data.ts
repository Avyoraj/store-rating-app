export interface Store {
  id: number
  name: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  website: string
  description: string
  average_rating: number
  total_reviews: number
  created_at: string
  category?: string
  image?: string
}

export interface Review {
  id: number
  store_id: number
  user_id: number
  rating: number
  comment: string
  created_at: string
  user_name: string
}

export interface User {
  id: number
  name: string
  email: string
  role: "user" | "owner" | "admin"
  address: string
  created_at: string
  is_active: boolean
}

export const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    address: "123 Main St, City, State",
    created_at: "2023-01-15T10:00:00Z",
    is_active: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "owner",
    address: "456 Oak Ave, City, State",
    created_at: "2023-02-20T14:30:00Z",
    is_active: true,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "user",
    address: "789 Pine Rd, City, State",
    created_at: "2023-03-10T09:15:00Z",
    is_active: false,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "owner",
    address: "321 Elm St, City, State",
    created_at: "2023-01-05T16:45:00Z",
    is_active: true,
  },
  {
    id: 5,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    address: "999 Admin Blvd, City, State",
    created_at: "2023-01-01T00:00:00Z",
    is_active: true,
  },
]

export const mockStores: Store[] = [
  {
    id: 1,
    name: "The Coffee Corner",
    email: "info@coffeecorner.com",
    address: "123 Main Street",
    city: "Downtown",
    state: "CA",
    zip_code: "90210",
    phone: "(555) 123-4567",
    website: "https://coffeecorner.com",
    description:
      "A cozy coffee shop serving artisanal coffee and fresh pastries. Perfect for work meetings or casual hangouts.",
    average_rating: 4.5,
    total_reviews: 127,
    created_at: "2023-01-15T10:00:00Z",
    category: "Food & Beverage",
    image: "/cozy-coffee-shop.png",
  },
  {
    id: 2,
    name: "Tech Repair Pro",
    email: "support@techrepairpro.com",
    address: "456 Oak Avenue",
    city: "Tech District",
    state: "CA",
    zip_code: "90211",
    phone: "(555) 234-5678",
    website: "https://techrepairpro.com",
    description:
      "Professional electronics repair service specializing in smartphones, laptops, and tablets. Quick turnaround guaranteed.",
    average_rating: 4.8,
    total_reviews: 89,
    created_at: "2023-02-20T14:30:00Z",
    category: "Electronics",
    image: "/modern-electronics-repair-shop.jpg",
  },
  {
    id: 3,
    name: "Green Garden Nursery",
    email: "hello@greengarden.com",
    address: "789 Pine Road",
    city: "Garden Valley",
    state: "CA",
    zip_code: "90212",
    phone: "(555) 345-6789",
    website: "https://greengarden.com",
    description:
      "Your local plant paradise with a wide selection of indoor and outdoor plants, gardening supplies, and expert advice.",
    average_rating: 4.3,
    total_reviews: 156,
    created_at: "2023-03-10T09:15:00Z",
    category: "Home & Garden",
    image: "/plant-nursery-greenhouse.jpg",
  },
  {
    id: 4,
    name: "Bella's Italian Kitchen",
    email: "reservations@bellasitalian.com",
    address: "321 Elm Street",
    city: "Little Italy",
    state: "CA",
    zip_code: "90213",
    phone: "(555) 456-7890",
    website: "https://bellasitalian.com",
    description:
      "Authentic Italian cuisine made with fresh ingredients and traditional recipes passed down through generations.",
    average_rating: 4.7,
    total_reviews: 203,
    created_at: "2023-01-05T16:45:00Z",
    category: "Food & Beverage",
    image: "/elegant-italian-restaurant.png",
  },
  {
    id: 5,
    name: "FitLife Gym",
    email: "info@fitlifegym.com",
    address: "654 Fitness Blvd",
    city: "Health District",
    state: "CA",
    zip_code: "90214",
    phone: "(555) 567-8901",
    website: "https://fitlifegym.com",
    description:
      "State-of-the-art fitness facility with modern equipment, group classes, and personal training services.",
    average_rating: 4.2,
    total_reviews: 94,
    created_at: "2023-02-28T11:20:00Z",
    category: "Health & Fitness",
    image: "/modern-gym-equipment.png",
  },
  {
    id: 6,
    name: "BookHaven",
    email: "contact@bookhaven.com",
    address: "987 Library Lane",
    city: "Literary Quarter",
    state: "CA",
    zip_code: "90215",
    phone: "(555) 678-9012",
    website: "https://bookhaven.com",
    description:
      "Independent bookstore featuring curated selections, author events, and a cozy reading corner with coffee.",
    average_rating: 4.6,
    total_reviews: 78,
    created_at: "2023-03-15T13:10:00Z",
    category: "Books & Media",
    image: "/cozy-independent-bookstore.jpg",
  },
  {
    id: 7,
    name: "AutoCare Express",
    email: "service@autocareexpress.com",
    address: "147 Motor Way",
    city: "Auto District",
    state: "CA",
    zip_code: "90216",
    phone: "(555) 789-0123",
    website: "https://autocareexpress.com",
    description: "Fast and reliable automotive service including oil changes, tire rotation, and general maintenance.",
    average_rating: 4.1,
    total_reviews: 112,
    created_at: "2023-01-25T08:30:00Z",
    category: "Automotive",
    image: "/clean-automotive-service-center.jpg",
  },
  {
    id: 8,
    name: "Artisan Bakery",
    email: "orders@artisanbakery.com",
    address: "258 Baker Street",
    city: "Culinary District",
    state: "CA",
    zip_code: "90217",
    phone: "(555) 890-1234",
    website: "https://artisanbakery.com",
    description:
      "Handcrafted breads, pastries, and cakes made daily with organic ingredients and traditional techniques.",
    average_rating: 4.9,
    total_reviews: 167,
    created_at: "2023-02-12T06:00:00Z",
    category: "Food & Beverage",
    image: "/artisan-bakery-fresh-bread.png",
  },
]

export const mockReviews: Review[] = [
  {
    id: 1,
    store_id: 1,
    user_id: 1,
    rating: 5,
    comment: "Amazing coffee and friendly staff! The atmosphere is perfect for working or catching up with friends.",
    created_at: "2024-01-15T10:30:00Z",
    user_name: "Sarah Johnson",
  },
  {
    id: 2,
    store_id: 1,
    user_id: 2,
    rating: 4,
    comment: "Great coffee, but can get quite busy during peak hours. Still worth the wait!",
    created_at: "2024-01-10T14:20:00Z",
    user_name: "Mike Chen",
  },
  {
    id: 3,
    store_id: 1,
    user_id: 3,
    rating: 5,
    comment: "Love their pastries! The croissants are fresh and buttery. Highly recommend.",
    created_at: "2024-01-08T09:15:00Z",
    user_name: "Emily Davis",
  },
  {
    id: 4,
    store_id: 2,
    user_id: 4,
    rating: 5,
    comment: "Fixed my phone screen in under an hour. Professional service and fair pricing.",
    created_at: "2024-01-12T16:45:00Z",
    user_name: "David Wilson",
  },
  {
    id: 5,
    store_id: 2,
    user_id: 5,
    rating: 4,
    comment: "Good repair service, though a bit pricey. Quality work though.",
    created_at: "2024-01-05T11:30:00Z",
    user_name: "Lisa Brown",
  },
  {
    id: 6,
    store_id: 3,
    user_id: 6,
    rating: 4,
    comment: "Great selection of plants and knowledgeable staff. Helped me choose the perfect plants for my apartment.",
    created_at: "2024-01-14T13:20:00Z",
    user_name: "Alex Thompson",
  },
]

export const categories = [
  "All Categories",
  "Food & Beverage",
  "Electronics",
  "Home & Garden",
  "Health & Fitness",
  "Books & Media",
  "Automotive",
]
