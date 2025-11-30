import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Police arabe en base64 (Amiri - open source)
// Pour simplifier, nous utiliserons la police par défaut de jsPDF
// et ajusterons le texte pour qu'il s'affiche correctement

export async function exportConversationToPDF(conversation, userName) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Fonction pour ajouter une nouvelle page si nécessaire
  const checkPageBreak = (neededSpace) => {
    if (yPosition + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Fonction pour écrire du texte arabe (RTL)
  const writeArabicText = (text, x, y, options = {}) => {
    const fontSize = options.fontSize || 12;
    const fontStyle = options.fontStyle || 'normal';
    const align = options.align || 'right';
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    // Inverser le texte arabe pour l'affichage correct
    const reversedText = text.split('').reverse().join('');
    
    const lines = doc.splitTextToSize(reversedText, maxWidth);
    
    lines.forEach((line, index) => {
      const lineY = y + (index * (fontSize * 0.5));
      checkPageBreak(fontSize * 0.5);
      
      if (align === 'right') {
        doc.text(line, pageWidth - margin, lineY, { align: 'right' });
      } else if (align === 'center') {
        doc.text(line, pageWidth / 2, lineY, { align: 'center' });
      } else {
        doc.text(line, margin, lineY);
      }
    });
    
    return lines.length * (fontSize * 0.5);
  };

  // En-tête du document
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('yafaqih | يفقه', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('المساعد الإسلامي', pageWidth / 2, 28, { align: 'center' });

  yPosition = 55;

  // Titre de la conversation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleHeight = writeArabicText(
    conversation.title || 'محادثة جديدة',
    pageWidth - margin,
    yPosition,
    { fontSize: 18, fontStyle: 'bold', align: 'right' }
  );
  yPosition += titleHeight + 10;

  // Informations sur la conversation
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  const dateStr = new Date(conversation.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const infoText = `التاريخ: ${dateStr} | المستخدم: ${userName || 'مستخدم'}`;
  const infoHeight = writeArabicText(infoText, pageWidth - margin, yPosition, {
    fontSize: 10,
    align: 'right'
  });
  yPosition += infoHeight + 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Messages de la conversation
  if (conversation.messages && conversation.messages.length > 0) {
    conversation.messages.forEach((message, index) => {
      checkPageBreak(30);

      // Badge pour identifier le rôle
      const isUser = message.role === 'user';
      const bgColor = isUser ? [59, 130, 246] : [16, 185, 129]; // Blue ou Emerald
      const label = isUser ? 'أنت' : 'المساعد الإسلامي';

      // Badge
      doc.setFillColor(...bgColor);
      doc.roundedRect(pageWidth - margin - 30, yPosition - 5, 25, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const reversedLabel = label.split('').reverse().join('');
      doc.text(reversedLabel, pageWidth - margin - 17, yPosition, { align: 'center' });
      
      yPosition += 12;

      // Contenu du message
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const messageHeight = writeArabicText(message.content, pageWidth - margin, yPosition, {
        fontSize: 11,
        align: 'right'
      });
      yPosition += messageHeight + 5;

      // Références (si disponibles)
      if (message.references) {
        let refs = [];
        try {
          refs = typeof message.references === 'string' 
            ? JSON.parse(message.references) 
            : message.references;
        } catch (e) {
          refs = [];
        }

        if (refs.length > 0) {
          checkPageBreak(20);
          
          // Titre "المراجع"
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          const refTitleHeight = writeArabicText('المراجع:', pageWidth - margin, yPosition, {
            fontSize: 10,
            fontStyle: 'bold',
            align: 'right'
          });
          yPosition += refTitleHeight + 3;

          // Chaque référence
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          
          refs.forEach((ref) => {
            checkPageBreak(10);
            const refHeight = writeArabicText(`• ${ref}`, pageWidth - margin, yPosition, {
              fontSize: 9,
              align: 'right'
            });
            yPosition += refHeight + 2;
          });
        }
      }

      // Espace entre les messages
      yPosition += 10;

      // Ligne de séparation (sauf pour le dernier message)
      if (index < conversation.messages.length - 1) {
        checkPageBreak(5);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
  }

  // Pied de page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    
    // Numéro de page
    const pageNumText = `صفحة ${i} من ${totalPages}`;
    const reversedPageNum = pageNumText.split('').reverse().join('');
    doc.text(reversedPageNum, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // URL du site
    doc.text('www.yafaqih.app', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  // Générer le nom du fichier
  const fileDate = new Date(conversation.createdAt).toISOString().split('T')[0];
  const fileName = `yafaqih_conversation_${fileDate}.pdf`;

  // Télécharger le PDF
  doc.save(fileName);
}

// Fonction pour exporter la conversation courante (messages en mémoire)
export function exportCurrentConversationToPDF(messages, userName, title) {
  const conversation = {
    title: title || 'محادثة جديدة',
    createdAt: new Date(),
    messages: messages
      .filter(msg => msg.id !== 1) // Exclure le message de bienvenue
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        references: msg.references || []
      }))
  };

  return exportConversationToPDF(conversation, userName);
}