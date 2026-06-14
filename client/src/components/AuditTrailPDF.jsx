import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#e0e5ec',
    fontFamily: 'Courier',
  },
  headerBox: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#ff90e8',
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Courier-Bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  balanceBox: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 14,
    fontFamily: 'Courier-Bold',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: '#000000',
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#ffc900',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000000',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 12,
    fontFamily: 'Courier-Bold',
  },
  tableCell: {
    fontSize: 10,
  },
  notesRow: {
    backgroundColor: '#b8c1ec',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: '#000000',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  notesText: {
    fontSize: 10,
    fontFamily: 'Courier-Bold',
  }
});

const AuditTrailPDF = ({ userName, finalBalance, auditTrail }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Audit Statement</Text>
        <Text style={styles.subtitle}>Generated for: {userName}</Text>
      </View>
      
      <View style={styles.balanceBox}>
        <Text style={styles.balanceText}>
          NET BALANCE: {finalBalance >= 0 ? `+ Rs. ${finalBalance} (Gets back)` : `- Rs. ${Math.abs(finalBalance)} (Owes)`}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Description</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Impact</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Running Bal</Text></View>
        </View>

        {auditTrail.map((record, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{new Date(record.date).toLocaleDateString()}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{record.description}</Text></View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {record.type === 'credit' ? `+ Rs. ${record.amount}` : `- Rs. ${record.amount}`}
                </Text>
              </View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Rs. {record.runningBalance}</Text></View>
            </View>
            {record.notes && record.notes.includes('Converted') && (
              <View style={styles.notesRow}>
                <Text style={styles.notesText}>&gt; {record.notes}</Text>
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    </Page>
  </Document>
);

export default AuditTrailPDF;
