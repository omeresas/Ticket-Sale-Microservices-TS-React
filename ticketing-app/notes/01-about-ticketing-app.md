## Business Rules of the Ticketing App

The ticketing app will be similar to "stubhub" app. Some of the capabilites we are going to implement for the ticketing app are:

- Users can list a ticket for an event (sport, theatre etc) for sale.
- Other users can purchase this ticket.
- Any user can list tickets and purchase tickets.
- When a user attempts to purchase a ticket, the ticket is "locked" for 15 minutes. The user has 15 minutes to enter the payment info.
- While locked, no other user can purchase this ticket, it won't be even displayed for sale. After 15 minutes, the ticket should "unlock".
- Ticket prices can be edited if not locked. What if the seller tries to edit the price while another user tries to lock the ticket? This little item will introduce some concurreny issues...

The ticketing app will utilize real databases, production-grade event bus and commonly used payment APIs.

## Data Models

<style type="text/css">
</style>
<table class="tg">
<thead>
  <tr>
    <th class="tg-amwm" colspan="2">User</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-if35">Name</td>
    <td class="tg-if35">Type</td>
  </tr>
  <tr>
    <td class="tg-0lax">email</td>
    <td class="tg-0lax">string</td>
  </tr>
  <tr>
    <td class="tg-0lax">password</td>
    <td class="tg-0lax">string</td>
  </tr>
</tbody>
</table>

<style type="text/css">
</style>
<table class="tg">
<thead>
  <tr>
    <th class="tg-amwm" colspan="2">Order</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-if35">Name</td>
    <td class="tg-if35">Type</td>
  </tr>
  <tr>
    <td class="tg-0lax">userId</td>
    <td class="tg-0lax">Ref to User</td>
  </tr>
  <tr>
    <td class="tg-0lax">status</td>
    <td class="tg-ps66">Created | Cancelled |<br>AwaitingPayment | Completed</td>
  </tr>
  <tr>
    <td class="tg-0lax">ticketId</td>
    <td class="tg-0lax">Ref to Ticket</td>
  </tr>
  <tr>
    <td class="tg-0lax">expiresAt</td>
    <td class="tg-0lax">Date</td>
  </tr>
</tbody>
</table>
