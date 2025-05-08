
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Analytics = () => {
  return (
    <Helmet>
      <script defer data-domain="equestrianaintelligence.com" src="https://analytics.appetitecreative.com/js/script.js"></script>
    </Helmet>
  );
};

export default Analytics;
