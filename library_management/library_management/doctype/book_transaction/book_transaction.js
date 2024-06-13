// Copyright (c) 2023, ramjanali and contributors
// For license information, please see license.txt

frappe.ui.form.on('Book Transaction', {
    refresh(frm) {
        frm.set_query('member', function(doc) {
            return {
                filters: {
                    'membership_status': 'Active'
                }
            }
        });

        frm.set_query('asset', function(doc) {
            return {
                filters: {
                    'status': 'Available'
                }
            }
        });
        frm.add_custom_button('Generate OTP', function() {
            var otp = generateOTP();
            frm.set_value('otp', otp);
            frappe.msgprint(__("OTP generated successfully: ") + otp);
        });
        frm.add_custom_button(__('Verify'), function() {
            let d = new frappe.ui.Dialog({
                fields: [
                    {
                        label: 'OTP',
                        fieldname: 'verify_otp',
                        fieldtype: 'Data'
                    }
                ],
                primary_action_label: 'Save',
                primary_action(values) {
                    verify_member(frm, values.verify_otp); // Pass the entered OTP to the function
                    d.hide();
                }
            });

            d.show();
        });
    },
    scan_barcode() {
		frappe.flags.dialog_set = false;
		const barcode_scanner = new erpnext.utils.BarcodeScanner({ frm: this.frm });
		barcode_scanner.process_scan();
	},
    onload: function(frm) {
        frm.fields_dict['book_transaction_detail'].grid.get_field('access_no').get_query = function(doc, cdt, cdn) {
            // Get the value of the "transaction_type" field
            var transactionType = frm.doc.transaction_type;

            // Set up the filter based on the value of "transaction_type"
            var filters = {};

            if (transactionType === "Issue") {
                filters = {
                    "status": "Available"
                };
            } else {
                filters = {
                    "status": "Issue"
                };
            }

            return {
                "filters": filters
            };
        };
    },
    asset:function(frm){
        var issue = frm.doc.issue_date;
        var due = frappe.datetime.add_days(issue, 30);
        frm.set_value('due_date', due);
    },
    from_date: function(frm){
        var issue = frm.doc.issue_date;
        var due = frappe.datetime.add_days(issue, 30);
        frm.set_value('due_date', due);
    },
    transaction_type: function(frm) {
        frm.fields_dict['book_transaction_detail'].grid.get_field('access_no').get_query = function(doc, cdt, cdn) {
            // Get the value of the "transaction_type" field
            var transactionType = frm.doc.transaction_type;

            // Set up the filter based on the value of "transaction_type"
            var filters = {};

            if (transactionType === "Issue") {
                filters = {
                    "status": "Available"
                };
            } else {
                filters = {
                    "status": "Issue"
                };
            }

            return {
                "filters": filters
            };
        };
    },
    member: function(frm) {
        if (frm.doc.member) {
            // frappe.db.get_value("Library Setting", "number_of_book_allowed", "number_of_book_allowed").then(function(r){
            //     if (r.message && r.message.number_of_book_allowed !== undefined) {
            //         console.log(r.message.number_of_book_allowed);
            //         frappe.msgprint(__('Allowed') + ': ' + r.message.number_of_book_allowed);
            //     } else {
            //         console.log("Field 'number_of_book_allowed' not found or not set.");
            //         frappe.msgprint(__('Field "number_of_book_allowed" not found or not set.'));
            //     }
            // });
            //frappe.msgprint(__('Allowed') + ': ' + nob);
            // frappe.call({
            //     method: "library_management.library_management.doctype.book_reservation.book_reservation.default_book",
            //     args: {
            //         member: frm.doc.member
            //     },
            //     callback: function(response) {
            //         var issuedbook = response.message;
                    
            //         if (response.message) {
            //             frappe.msgprint(__('Already Issued Book') + ': ' + issuedbook);
            //             //frm.set_value('issued_book', response.message.count);
            //         } else {
            //             frappe.msgprint(__('Error fetching books count'));
            //         }
            //     }
            // })
            frappe.call({
                method: "library_management.library_management.doctype.book_reservation.book_reservation.count_books_issued",
                args: {
                    member: frm.doc.member
                },
                
                callback: function(response) {
                    var issuedbook = response.message.count;
                    
                    if (response.message) {
                        frappe.msgprint(__('Already Issued Book') + ': ' + issuedbook);
                        frm.set_value('issued_book', response.message.count);
                    } else {
                        frappe.msgprint(__('Error fetching books count'));
                    }
                }
            });
        } else {
            frm.set_value('issued_book', 0);
        }
    }
});

function verify_member(frm, enteredOTP) {
    var generatedOTP = frm.doc.otp;
    if (generatedOTP === enteredOTP) {
        frappe.msgprint(__('Verify Member'));
    } else {
        frappe.msgprint(__('Enter Valid OTP'));
    }
}

function generateOTP() {
    var otp = '';
    var possibleDigits = '0123456789';

    for (var i = 0; i < 6; i++) {
        otp += possibleDigits.charAt(Math.floor(Math.random() * possibleDigits.length));
    }
    return otp;
}
frappe.ui.form.on("Book Transaction Detail", {
    access_no: function(frm, cdt, cdn) {
        var child_doc = locals[cdt][cdn];
        var due = frappe.datetime.add_days(child_doc.transaction_date, 30);
        frappe.model.set_value(cdt, cdn, 'due_date', due);
    },
    transaction_date: function(frm, cdt, cdn) {
        var child_doc = locals[cdt][cdn];
        var due = frappe.datetime.add_days(child_doc.transaction_date, 30);
        frappe.model.set_value(cdt, cdn, 'due_date', due);
    },
});


