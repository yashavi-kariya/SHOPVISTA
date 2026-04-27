// import React, { useContext, useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { CartContext } from "../context/CartContext";
// import api from "api";
// import heartIcon from "../assets/img/icon/heart.png";
// import compareIcon from "../assets/img/icon/compare.png";
// import searchIcon from "../assets/img/icon/search.png";

// const CategoryPage = () => {
//     const { name } = useParams();       // women, men, bags, shoes...
//     const { addToCart } = useContext(CartContext);
//     const [products, setProducts] = useState([]);


//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const res = await api.get("/api/products");

//                 // filter by category
//                 const filtered = res.data.filter(
//                     (p) => p.category.toLowerCase() === name.toLowerCase()
//                 );

//                 setProducts(filtered);
//             } catch (error) {
//                 console.error("Error loading products:", error);
//             }
//         };

//         fetchProducts();
//     }, [name]);


//     return (
//         <>
//             {/* Breadcrumb */}
//             <section className="breadcrumb-option">
//                 <div className="container">
//                     <div className="breadcrumb__text">
//                         <h4>{name.toUpperCase()}</h4>
//                         <div className="breadcrumb__links">
//                             <Link to="/">Home</Link>
//                             <span>{name}</span>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Products */}
//             <section className="shop spad">
//                 <div className="container">
//                     <div className="row">

//                         <div className="col-lg-3"></div>

//                         <div className="col-lg-9">
//                             <div className="row">

//                                 {products.map((item) => (
//                                     <div className="col-lg-4 col-md-6 col-sm-6" key={item._id}>
//                                         <div className="product__item">
//                                             <div
//                                                 className="product__item__pic"
//                                                 style={{
//                                                     backgroundImage: `url(${item.images?.[0] || "/placeholder.png"})`
//                                                 }}
//                                             >
//                                                 <ul className="product__hover">
//                                                     <li><a><img src={heartIcon} alt="" /></a></li>
//                                                     <li><a><img src={compareIcon} alt="" /></a></li>
//                                                     <li>
//                                                         <Link to={`/product/${item._id}`}>
//                                                             <img src={searchIcon} alt="" />
//                                                         </Link>
//                                                     </li>
//                                                 </ul>
//                                             </div>

//                                             <div className="product__item__text">
//                                                 <h6>{item.name}</h6>

//                                                 <a
//                                                     className="add-cart"
//                                                     onClick={() => addToCart(item)}
//                                                     style={{ cursor: "pointer" }}
//                                                 >
//                                                     + Add To Cart
//                                                 </a>

//                                                 <div className="rating">
//                                                     {[1, 2, 3, 4, 5].map((n) => (
//                                                         <i key={n} className="fa fa-star-o"></i>
//                                                     ))}
//                                                 </div>

//                                                 <h5>${item.price}.00</h5>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}

//                                 {products.length === 0 && (
//                                     <h3>No products found.</h3>
//                                 )}

//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </section>
//         </>
//     );
// };

// export default CategoryPage;

