Fix the rider delivery workflow and assignment system.

## Issue 1: Rider should automatically become online

Currently riders must manually become online.

Required behavior:

* When a rider successfully logs in, automatically set:

  * online_status = true
  * availability_status = available
  * last_seen = current timestamp
* Establish Socket.IO connection immediately after login.
* Send heartbeat updates automatically while the app is active.
* If the rider logs out:

  * online_status = false
  * availability_status = offline
* If no activity is detected for 5 minutes:

  * online_status = false
  * availability_status = offline
* Remove the requirement for riders to manually toggle online after login.

## Issue 2: Rider gets blank screen after accepting assignment

Current error:

TypeError: Cannot read properties of undefined (reading 'slice')

This occurs immediately after the rider accepts a delivery assignment.

Tasks:

1. Find the exact source of the error.
2. Identify which field is undefined and where .slice() is being called.
3. Add defensive checks before calling:

   * slice()
   * substring()
   * map()
   * filter()
   * reduce()
4. Ensure all order data is validated before rendering.
5. Prevent any rider page from crashing because of missing order fields.
6. Add loading and error states.
7. If required order information is missing, display a fallback message instead of a blank screen.

Example:

Bad:
order.id.slice(0,8)

Good:
order?.id ? order.id.slice(0,8) : "Unknown Order"

## Issue 3: Delivery workflow is incorrect

Current workflow:
Order Assigned → Rider Accepts → Delivered

This is not enough verification.

Replace with the following workflow.

### Step 1: Order Assigned

Status:
ASSIGNED

Rider receives notification.

Actions:

* Accept
* Reject

### Step 2: Rider Accepts

Status:
ACCEPTED

After accepting:

* Redirect rider to active delivery screen.
* Show:

  * Restaurant details
  * Customer details
  * Pickup location
  * Delivery location
  * Call buttons
  * Navigation buttons

The rider should NOT immediately see delivery completion options.

## Step 3: Restaurant Verification

Status:
READY_FOR_PICKUP

Restaurant dashboard should display:

"Rider Arrived"

Button:
MARK AS PICKED UP

Only restaurant staff/vendor can click this button.

When clicked:

* Verify that rider has collected the order.
* Update order status:

PICKED_UP

Send notifications to:

* Rider
* Customer

This serves as proof that the rider actually collected the food.

## Step 4: Rider Starts Delivery

Once restaurant marks PICKED_UP:

Status:
OUT_FOR_DELIVERY

Rider dashboard should show:

* Customer information
* Delivery address
* Navigation
* Call customer button

Button:
MARK AS DELIVERED

Only rider can click.

When clicked:
Status becomes:

DELIVERED_PENDING_CUSTOMER_CONFIRMATION

Notify customer:
"Your order has arrived. Please confirm receipt."

## Step 5: Customer Verification

Customer sees:

Order Delivered

Button:
CONFIRM RECEIVED

Only customer can click.

When clicked:
Status becomes:

COMPLETED

Notifications:

* Rider
* Restaurant

Only after customer confirms receipt should:

* Ratings become available
* Reviews become available
* Order be considered completed

## Status Flow

ASSIGNED
↓
ACCEPTED
↓
READY_FOR_PICKUP
↓
PICKED_UP
↓
OUT_FOR_DELIVERY
↓
DELIVERED_PENDING_CUSTOMER_CONFIRMATION
↓
COMPLETED

## Permissions

Rider:

* Accept Assignment
* Reject Assignment
* Mark Delivered

Restaurant:

* Mark Picked Up

Customer:

* Confirm Received
* Leave Reviews

Ensure role-based authorization checks are enforced in backend APIs.

## Notifications

Send real-time Socket.IO notifications for every state change:

ASSIGNED
ACCEPTED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED_PENDING_CUSTOMER_CONFIRMATION
COMPLETED

## Frontend Updates

### Rider Dashboard

After accepting:

* Automatically navigate to Active Delivery page.
* No blank screen.
* Display delivery progress timeline.

### Restaurant Dashboard

Add:

* Rider Arrived card
* Mark As Picked Up button

### Customer Order Tracking

Add:

* Live order status tracking
* Confirm Received button
* Delivery timeline

## Testing

Add tests for:

* Rider auto-online on login
* Rider auto-offline after inactivity
* Assignment acceptance flow
* Restaurant pickup verification
* Rider delivery confirmation
* Customer receipt confirmation
* Protection against undefined data causing .slice() crashes
* End-to-end delivery workflow

Follow the existing project architecture and update backend, frontend, database, Socket.IO events, APIs, and UI components accordingly.
