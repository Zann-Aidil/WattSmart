"use client";

import { TrendingUp, Leaf, ShieldCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Prediksi Akurat",
    description: "Algoritma cerdas dengan akurasi hingga 94.2% untuk perencanaan energi yang lebih baik.",
    icon: TrendingUp,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    title: "Rekomendasi Personal",
    description: "Saran penghematan yang disesuaikan dengan pola penggunaan listrik rumah Anda.",
    icon: Leaf,
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    title: "Hemat Biaya",
    description: "Kurangi tagihan listrik hingga 20% dengan tips dan rekomendasi yang tepat.",
    icon: ShieldCheck,
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600"
  },
  {
    title: "Pantau Mudah",
    description: "Dashboard intuitif untuk memantau konsumsi listrik kapan saja dan di mana saja.",
    icon: BarChart3,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  }
];

export function WhyUsSection() {
  return (
    <section className="py-24 bg-white" id="fitur">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kenapa Memilih <span className="text-emerald-600">WattSmart?</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Solusi prediksi dan efisiensi energi yang dirancang untuk kebutuhan rumah tangga modern.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bgColor} ${feature.iconColor}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
