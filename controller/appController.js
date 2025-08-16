const db = require("../database");
const fs = require("fs");
const XLSX = require("xlsx");
const {
  parseExcelToUsers,
  insertUsers,
  createContactService,
  fetchByMailService,
  updateByIdService,
  fetchByIdService,
  fetchAllService,
  deleteByIdService,
} = require("../service/appContactService");

const createContact = async (req, resp) => {
  let conn;
  try {
    const { username, email, phonenumber } = req.body;
    const result = await createContactService(username, email, phonenumber);
    resp.status(201).json({ data: result });
  } catch (err) {
    console.log("failed to create contact", err.stack || err);
    resp.status(500).json({ error: "failed to create task" });
  } finally {
    if (conn) conn.release();
  }
};

const fetchAll = async (req, resp) => {
  try {
    const { phonenumber, id, email, page = 1, limit = 10, search } = req.query;

    const result = await fetchAllService(phonenumber, id, email);

    // Always ensure result is an array
    let contactsArray = result || [];

    // Search filter (before pagination)
    if (search) {
      const searchTerm = search.toLowerCase();
      contactsArray = contactsArray.filter(
        (contact) =>
          (contact.username &&
            contact.username.toLowerCase().includes(searchTerm)) ||
          (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
          (contact.phonenumber &&
            contact.phonenumber.toString().includes(searchTerm)) ||
          (contact.id && contact.id.toString().includes(searchTerm))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = contactsArray.slice(startIndex, endIndex);

    // Send paginated results
    resp.status(200).json({
      total: contactsArray.length, // total after filtering
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginatedData,
    });
  } catch (err) {
    console.log("failed to get contact", err.stack || err);
    resp.status(500).json({ error: "failed to get task" });
  }
};

const fetchById = async (req, resp) => {
  let conn;
  try {
    const id = parseInt(req.params.id);
    const contacts = await fetchByIdService(id);
    resp.status(200).json({ data: contacts });
  } catch (err) {
    console.log("failed to get contact", err.stack || err);
    resp.status(500).json({ error: "failed to get task" });
  } finally {
    if (conn) conn.release();
  }
};

const updateById = async (req, resp) => {
  let conn;
  try {
    const id = parseInt(req.params.id);
    const { username, email, phonenumber } = req.body;
    const existingContacts = await fetchByMailService(email, phonenumber, id);
    if (Array.isArray(existingContacts) && existingContacts.length > 0) {
      return resp.status(404).json({
        message:
          "Another contact already exists with this email or phone number",
      });
    }
    const result = await updateByIdService(username, email, phonenumber, id);
    if (result.affectedRows === 0) {
      return resp
        .status(404)
        .json({ message: "No contact found with the given ID" });
    }
    resp.status(200).json({ data: " contacts updated successfully" });
  } catch (err) {
    console.log("failed to update contact", err.stack || err);
    resp.status(500).json({ error: "failed to update task" });
  } finally {
    if (conn) conn.release();
  }
};

const deleteById = async (req, resp) => {
  try {
    const id = parseInt(req.params.id);

    const result = await deleteByIdService(id);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No contact found with the given ID" });
    }
    resp.status(200).json({ data: "contact deleted" });
  } catch (err) {
    console.log("failed to delete contact", err.stack || err);
    resp.status(500).json({ error: "failed to delete task" });
  } finally {
    if (conn) conn.release();
  }
};

const uploadUsers = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Excel file is required" });

    const users = parseExcelToUsers(req.file.path);
    if (!users.length) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({ message: "No usable rows found in the Excel file" });
    }

    const result = await insertUsers(users);

    // Optional: delete file after processing
    fs.unlink(req.file.path, () => {});

    return res.status(201).json({
      message: "Import completed",
      inserted: result.inserted,
      failed: result.failed,
      errors: result.errors,
    });
  } catch (err) {
    // Optional: delete file on error
    console.log(err);
    if (req.file) fs.unlink(req.file.path, () => {});
    return res
      .status(500)
      .json({ message: "Failed to import users", error: err.message });
  }
};

const exportAll = async (req, res) => {
  try {
    const result = await fetchAllService();
    const worksheet = XLSX.utils.json_to_sheet(result);

    // Step 2: Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
    "Content-Disposition",
    "attachment; filename=output.xlsx"
  );
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
  } catch (err) {
    console.log("failed to get contact", err.stack || err);
    resp.status(500).json({ error: "failed to get task" });
  }
};

module.exports = {
  exportAll,
  uploadUsers,
  createContact,
  fetchAll,
  fetchById,
  updateById,
  deleteById,
};
