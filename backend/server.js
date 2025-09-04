import express from "express";
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import admin from "firebase-admin";
import cors from "cors";
import QRCode from "qrcode";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // allow Vite frontend

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// // Optional test for purchase
// app.get("/api/purchase", (req, res) => {
//   res.send("⚠️ Use POST method for /api/purchase");
// });

// app.post("/api/purchase", async (req, res) => {
//   try {
//     const { reference, email, eventId } = req.body;
// console.log(req.body, "===>>>> body");
//     if (!reference || !email || !eventId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     // Verify with Paystack
//     const verifyRes = await fetch(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
//     );
//     const verifyData = await verifyRes.json();
// console.log(verifyData, "===>>>>> Verify data");
//     if (!verifyData.status) {
//       return res.status(400).json({ error: "Payment not verified" });
//     }

//     const ticketRef = db.collection("tickets").doc();
//     await ticketRef.set({ email, eventId, reference, createdAt: new Date() });

//     // Send email
//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // await transporter.sendMail({
//     //   from: `"Airways Events" <${process.env.EMAIL_USER}>`,
//     //   to: email,
//     //   subject: "Your Ticket Confirmation",
//     //   text: `Thank you for your purchase! Ticket: ${ticketType}. Ref: ${reference}`,
//     // });

//     res.json({ success: true, ticketId: ticketRef.id });
//   } catch (err) {
//     console.error("API error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
app.post("/api/purchase", async (req, res) => {
  try {
    const { reference, email, eventId } = req.body;
    console.log(req.body, "===>>>> body");

    // // Validate request body
    // if (!reference || !email || !eventId) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }
    console.log(reference)
    console.log(eventId)
    console.log(email)
    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();
    console.log(verifyData, "===>>>>> Verify data");

    // Ensure Paystack verification succeeded
    if (!verifyData.status || verifyData.data.status !== "success") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    // Save ticket in Firestore
    const ticketRef = db.collection("tickets").doc();
    await ticketRef.set({
      email,
      eventId,
      reference,
      amount: verifyData.data.amount / 100, // Paystack returns amount in kobo
      status: verifyData.data.status,
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // const qrCodeData = await QRCode.toDataURL(ticketRef.id);

    // (Optional) Send email here using nodemailer
    // Uncomment and configure correctly if needed

    
    // Build HTML email with QR Code
    // const htmlTemplate = `
    //   <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:12px; padding:20px;">
    //     <h2 style="color:#2C3E50; text-align:center;">🎫 Your Ticket is Confirmed!</h2>
    //     <p>Hello,</p>
    //     <p>Thank you for purchasing a ticket with <b>Airways Events</b>. Below are your ticket details:</p>
        
    //     <table style="width:100%; border-collapse:collapse; margin:20px 0;">
    //       <tr><td><b>Event ID:</b></td><td>${eventId}</td></tr>
    //       <tr><td><b>Reference:</b></td><td>${reference}</td></tr>
    //       <tr><td><b>Amount:</b></td><td>₦${verifyData.data.amount / 100}</td></tr>
    //       <tr><td><b>Status:</b></td><td style="color:green;">${verifyData.data.status}</td></tr>
    //     </table>

    //     <p style="text-align:center; margin:20px 0;">
    //       <img src="${qrCodeData}" alt="Ticket QR Code" style="width:200px; height:200px;" />
    //     </p>

    //     <p style="text-align:center;">
    //       <a href="https://yourdomain.com/tickets/${ticketRef.id}" 
    //          style="background:#3498DB; color:white; padding:10px 20px; text-decoration:none; border-radius:6px;">
    //          View Your Ticket
    //       </a>
    //     </p>

    //     <p style="font-size:12px; color:#555; text-align:center; margin-top:30px;">
    //       If you did not make this purchase, please contact support immediately.
    //     </p>
    //   </div>
    // `;

    // try {
    //   await sgMail.send({
    //     to: email,
    //     from: process.env.SENDGRID_FROM, // must be a verified sender
    //     subject: "🎉 Your Ticket Confirmation",
    //     html: htmlTemplate,
    //   });
    //   console.log("✅ Email sent via SendGrid");
    // } catch (mailErr) {
    //   console.error("❌ SendGrid error:", mailErr.response?.body || mailErr);
    // }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const ticketType = "regular"
    
    await transporter.sendMail({
      from: `"Airways Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Ticket Confirmation",
      text: `Thank you for your purchase! Ticket: ${ticketType}. Ref: ${reference}`,
    });

    res.json({ success: true, ticketId: ticketRef.id });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("✅ Backend running at http://localhost:3000"));
