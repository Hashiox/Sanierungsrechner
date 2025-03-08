// PDFGenerator.js - The separate PDF generation file
import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingTop: 8,
    paddingBottom: 8,
  },
  tableHeaderCell: {
    width: '33%',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    width: '33%',
    fontSize: 12,
  },
  chartContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 200,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  }
});

// PDF Document definition
const MyDocument = ({ data, chartImageUrl, title = "Sales Report" }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>{title}</Text>
      
      <View style={styles.section}>
        <Text style={styles.subheading}>Monthly Performance</Text>
        <Text style={styles.text}>This report provides an overview of performance for the selected data.</Text>
        
        {/* Numeric data summary */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Key Metrics</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>Month</Text>
            <Text style={styles.tableHeaderCell}>Sales</Text>
            <Text style={styles.tableHeaderCell}>Profit</Text>
          </View>
          
          {data.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>${item.value}</Text>
              <Text style={styles.tableCell}>${item.profit}</Text>
            </View>
          ))}
        </View>
        
        {/* Image for chart */}
        {chartImageUrl && (
          <View style={styles.chartContainer}>
            <Text style={styles.subheading}>Sales Trend</Text>
            <Image src={chartImageUrl} />
          </View>
        )}
      </View>
      
      <Text style={styles.footer}>Generated on {new Date().toLocaleDateString()}</Text>
    </Page>
  </Document>
);

// Function to convert a DOM element to an image URL
export const convertChartToImage = async (chartRef) => {
  if (!chartRef.current) return null;
  
  try {
    const canvas = await html2canvas(chartRef.current);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error converting chart to image:", error);
    return null;
  }
};

// PDF Download Button Component
export const PDFDownloadButton = ({ data, chartImageUrl, fileName = "report.pdf", title = "Report" }) => {
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <PDFDownloadLink 
      document={<MyDocument data={data} chartImageUrl={chartImageUrl} title={title} />}
      fileName={fileName}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded inline-block transition"
    >
      {({ blob, url, loading, error }) => 
        loading ? 'Preparing PDF...' : 'Download PDF Report'
      }
    </PDFDownloadLink>
  );
};