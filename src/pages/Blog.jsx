import React, { useState, useEffect } from "react";
// import api from "api";
import api from "../api";
import breadcrumbBg from "../assets/img/breadcrumb-bg.jpg";
import calendarIcon from "../assets/img/icon/calendar.png";
import { Link } from "react-router-dom";

const Blog = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        api.get("http://localhost:3001/api/blogs")
            .then(res => setBlogs(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <section className="breadcrumb-blog set-bg" style={{ backgroundImage: `url(${breadcrumbBg})` }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12"><h2>Our Blog</h2></div>
                    </div>
                </div>
            </section>

            <section className="blog spad">
                <div className="container">
                    <div className="row">
                        {blogs.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#aaa" }}>No blogs yet.</p>
                        ) : blogs.map((item) => (
                            <div className="col-lg-4 col-md-6 col-sm-6" key={item._id}>
                                <div className="blog__item">
                                    <div className="blog__item__pic set-bg"
                                        style={{ backgroundImage: `url(${item.img})` }} />
                                    <div className="blog__item__text">
                                        <span><img src={calendarIcon} alt="calendar" /> {item.date}</span>
                                        <h5>{item.title}</h5>
                                        <Link to={`/blog/${item._id}`}>Read More</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Blog;
// import React from "react";

// // Import images (place them inside /src/assets/img/)
// import breadcrumbBg from "../assets/img/breadcrumb-bg.jpg";
// import calendarIcon from "../assets/img/icon/calendar.png";

// import blog1 from "../assets/img/blog/blog-1.jpg";
// import blog2 from "../assets/img/blog/blog-2.jpg";
// import blog3 from "../assets/img/blog/blog-3.jpg";
// import blog4 from "../assets/img/blog/blog-4.jpg";
// import blog5 from "../assets/img/blog/blog-5.jpg";
// import blog6 from "../assets/img/blog/blog-6.jpg";
// import blog7 from "../assets/img/blog/blog-7.jpg";
// import blog8 from "../assets/img/blog/blog-8.jpg";
// import blog9 from "../assets/img/blog/blog-9.jpg";

// const Blog = () => {
//     const blogs = [
//         { img: blog1, date: "16 February 2020", title: "What Curling Irons Are The Best Ones" },
//         { img: blog2, date: "21 February 2020", title: "Eternity Bands Do Last Forever" },
//         { img: blog3, date: "28 February 2020", title: "The Health Benefits Of Sunglasses" },
//         { img: blog4, date: "16 February 2020", title: "Aiming For Higher The Mastopexy" },
//         { img: blog5, date: "21 February 2020", title: "Wedding Rings A Gift For A Lifetime" },
//         { img: blog6, date: "28 February 2020", title: "The Different Methods Of Hair Removal" },
//         { img: blog7, date: "16 February 2020", title: "Hoop Earrings A Style From History" },
//         { img: blog8, date: "21 February 2020", title: "Lasik Eye Surgery Are You Ready" },
//         { img: blog9, date: "28 February 2020", title: "Lasik Eye Surgery Are You Ready" },
//     ];

//     return (
//         <>
//             {/* Breadcrumb Section */}
//             <section
//                 className="breadcrumb-blog set-bg"
//                 style={{ backgroundImage: `url(${breadcrumbBg})` }}
//             >
//                 <div className="container">
//                     <div className="row">
//                         <div className="col-lg-12">
//                             <h2>Our Blog</h2>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Blog Section */}
//             <section className="blog spad">
//                 <div className="container">
//                     <div className="row">
//                         {blogs.map((item, index) => (
//                             <div className="col-lg-4 col-md-6 col-sm-6" key={index}>
//                                 <div className="blog__item">
//                                     <div
//                                         className="blog__item__pic set-bg"
//                                         style={{ backgroundImage: `url(${item.img})` }}
//                                     ></div>

//                                     <div className="blog__item__text">
//                                         <span>
//                                             <img src={calendarIcon} alt="calendar" /> {item.date}
//                                         </span>
//                                         <h5>{item.title}</h5>
//                                         <a href="#">Read More</a>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>
//         </>
//     );
// };

// export default Blog;