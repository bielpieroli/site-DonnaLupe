package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
)

type EmailService interface {
	SendPaymentConfirmed(toName, toEmail string, data ConfirmEmailData) error
	SendPaymentCancelled(toName, toEmail string, orderID uint) error
	SendRefunded(toName, toEmail string, orderID uint, total float64) error
}

// ConfirmEmailItem representa um item do pedido para formatação no e-mail.
type ConfirmEmailItem struct {
	Name      string
	Quantity  int
	LineTotal float64
}

// ConfirmEmailData agrupa os dados necessários para o e-mail de confirmação de pagamento.
type ConfirmEmailData struct {
	OrderID      uint
	Items        []ConfirmEmailItem
	Subtotal     float64
	FreightCost  float64
	Total        float64
	DeliveryMode string // "pickup" | "delivery"
	PickupTime   string
	Address      string // endereço formatado para entrega
}

type emailService struct {
	host string
	port string
	user string
	pass string
	from string
}

func NewEmailService() EmailService {
	return &emailService{
		host: os.Getenv("SMTP_HOST"),
		port: os.Getenv("SMTP_PORT"),
		user: os.Getenv("SMTP_USER"),
		pass: os.Getenv("SMTP_PASS"),
		from: os.Getenv("SMTP_FROM"),
	}
}

func (s *emailService) send(to, subject, body string) error {
	if s.host == "" || s.user == "" || to == "" {
		log.Printf("[EMAIL] SMTP nao configurado ou destinatario vazio — simulando envio para %q: %s", to, subject)
		return nil
	}
	auth := smtp.PlainAuth("", s.user, s.pass, s.host)
	msg := strings.Join([]string{
		"From: " + s.from,
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"Content-Transfer-Encoding: quoted-printable",
		"",
		body,
	}, "\r\n")
	if err := smtp.SendMail(s.host+":"+s.port, auth, s.from, []string{to}, []byte(msg)); err != nil {
		log.Printf("[EMAIL] ERRO ao enviar para %q (%s): %v", to, subject, err)
		return err
	}
	log.Printf("[EMAIL] Enviado com sucesso para %q: %s", to, subject)
	return nil
}

func (s *emailService) SendPaymentConfirmed(toName, toEmail string, data ConfirmEmailData) error {
	log.Printf("[EMAIL] Preparando confirmacao de pagamento para %q (pedido #%d)", toEmail, data.OrderID)

	subject := fmt.Sprintf("Pedido #%d confirmado - DonnaLupe", data.OrderID)

	sep := strings.Repeat("-", 40)
	var sb strings.Builder

	fmt.Fprintf(&sb, "Ola, %s!\n\n", toName)
	fmt.Fprintf(&sb, "Recebemos o pagamento do seu pedido #%d.\n", data.OrderID)
	sb.WriteString("Muito obrigada pela confianca na DonnaLupe!\n\n")

	sb.WriteString(sep + "\n")
	fmt.Fprintf(&sb, "PEDIDO #%d\n", data.OrderID)
	sb.WriteString(sep + "\n\n")

	for _, item := range data.Items {
		line := fmt.Sprintf(" %dx %s", item.Quantity, item.Name)
		dots := 38 - len(line)
		if dots < 1 {
			dots = 1
		}
		fmt.Fprintf(&sb, "%s%s R$ %.2f\n", line, strings.Repeat(".", dots), item.LineTotal)
	}

	sb.WriteString("\n")
	fmt.Fprintf(&sb, " Subtotal %s R$ %.2f\n", strings.Repeat(".", 29), data.Subtotal)
	if data.FreightCost > 0 {
		fmt.Fprintf(&sb, " Frete    %s R$ %.2f\n", strings.Repeat(".", 29), data.FreightCost)
	} else {
		fmt.Fprintf(&sb, " Frete    %s Gratis\n", strings.Repeat(".", 29))
	}
	sb.WriteString(strings.Repeat("-", 40) + "\n")
	fmt.Fprintf(&sb, " TOTAL    %s R$ %.2f\n\n", strings.Repeat(".", 29), data.Total)

	sb.WriteString(sep + "\n")
	sb.WriteString("ENTREGA\n")
	sb.WriteString(sep + "\n\n")

	if data.DeliveryMode == "pickup" {
		sb.WriteString(" Retirada na loja\n")
		if data.PickupTime != "" {
			fmt.Fprintf(&sb, " Horario: %s\n", data.PickupTime)
		}
		sb.WriteString(" Centro Acdo. C.A.A.S.O.\n")
		sb.WriteString(" R. Dr. Carlos de Camargo Salles, Parque Arnold Schimidt\n")
		sb.WriteString(" Sao Carlos - SP\n")
	} else {
		sb.WriteString(" Endereco de entrega:\n")
		fmt.Fprintf(&sb, " %s\n", data.Address)
	}

	sb.WriteString("\n" + sep + "\n\n")
	sb.WriteString("Em caso de duvidas, fale com a gente pelo Instagram ou WhatsApp.\n\n")
	sb.WriteString("Com carinho,\n")
	sb.WriteString("Equipe DonnaLupe\n")

	return s.send(toEmail, subject, sb.String())
}

func (s *emailService) SendPaymentCancelled(toName, toEmail string, orderID uint) error {
	subject := fmt.Sprintf("Pedido #%d cancelado - DonnaLupe", orderID)
	body := fmt.Sprintf(
		"Ola, %s!\n\nInfelizmente seu pedido #%d foi cancelado.\n\nEm caso de duvidas, entre em contato pelo Instagram ou WhatsApp.\n\nEquipe DonnaLupe",
		toName, orderID,
	)
	return s.send(toEmail, subject, body)
}

func (s *emailService) SendRefunded(toName, toEmail string, orderID uint, total float64) error {
	subject := fmt.Sprintf("Reembolso do pedido #%d processado - DonnaLupe", orderID)
	body := fmt.Sprintf(
		"Ola, %s!\n\nO reembolso do seu pedido #%d (R$ %.2f) foi processado com sucesso.\nO valor sera estornado em ate 10 dias uteis.\n\nEquipe DonnaLupe",
		toName, orderID, total,
	)
	return s.send(toEmail, subject, body)
}
