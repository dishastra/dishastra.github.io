import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

export const Loader = () => (
  <motion.div
    className="loader-overlay"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    <span className="loader-wordmark">DISHASTRA</span>
    <div className="loader-spinner" aria-label="Loading…" role="status" />
  </motion.div>
);
