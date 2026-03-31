import { useEffect, useState } from "react";
import { AlertTriangle, KeyRound, Search, Trash2, UserX } from "lucide-react";
import { C } from "../../constants/designTokens.js";
import { Avatar, Card, SectionTitle } from "../../components/ui/Base.jsx";
import { useMobile } from "../../hooks/useMobile.js";
import api from "../../services/api.js";

export const AdminUsers = () => {
  const isMobile = useMobile();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirm, setConfirm]     = useState(null);   // user to delete
  const [pwdModal, setPwdModal]   = useState(null);   // user to change password
  const [newPwd, setNewPwd]       = useState("");
  const [pwdErr, setPwdErr]       = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [err, setErr]             = useState("");
  const [deleting, setDeleting]   = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const secResponse = await api.get('/admin/users');
      setUsers(secResponse.data.data || []);
    } catch (e) {
      setErr("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (user) => {
    setDeleting(true); setErr("");
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setConfirm(null);
    } catch (e) {
      setErr(e.response?.data?.message || "Error deleting user.");
    } finally {
      setDeleting(false);
    }
  };

  const changePassword = async () => {
    setPwdErr(""); setPwdSuccess("");
    if (!newPwd) {
      setPwdErr("Password is required.");
      return;
    }
    setPwdLoading(true);
    try {
      await api.put(`/admin/users/${pwdModal.id}/password`, { new_password: newPwd });
      setPwdSuccess("Password updated successfully.");
      setNewPwd("");
      setTimeout(() => { setPwdModal(null); setPwdSuccess(""); }, 1500);
    } catch (e) {
      const data = e.response?.data || {};
      setPwdErr(data.message || "Error updating password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleColors = { secretaire: C.tealDk, medecin: C.navy };
  const roleLabels = { secretaire: "Secretary", medecin: "Doctor" };

  return (
    <div>
      <SectionTitle sub="Manage secretary and doctor accounts">
        User Management
      </SectionTitle>

      {/* Filters */}
      <Card style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={13} color={C.gray400} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.navy, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "All"], ["secretaire", "Secretaries"], ["medecin", "Doctors"]].map(([val, label]) => (
              <button key={val} onClick={() => setRoleFilter(val)}
                style={{
                  padding: "7px 13px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${roleFilter === val ? C.tealDk : C.border}`,
                  background: roleFilter === val ? C.tealLt : C.white,
                  color: roleFilter === val ? C.tealDk : C.gray500,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {err && (
        <div style={{ background: C.redLt, color: C.red, borderRadius: 9, padding: "10px 13px", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", gap: 7, alignItems: "center" }}>
          <AlertTriangle size={14} /> {err}
        </div>
      )}

      {loading ? (
        <Card style={{ padding: "40px", textAlign: "center", color: C.gray500 }}>Loading...</Card>
      ) : filtered.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <UserX size={32} color={C.gray400} style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ color: C.gray500 }}>No users found.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((u) => (
            <Card key={u.id} style={{ padding: isMobile ? "12px 14px" : "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: isMobile ? "wrap" : "nowrap" }}>
              <Avatar name={`${u.prenom} ${u.nom}`} color={roleColors[u.role] || C.gray400} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>
                  {u.prenom} {u.nom}
                </div>
                <div style={{ fontSize: 12, color: C.gray500, marginTop: 2 }}>{u.email}</div>
                {u.specialite && <div style={{ fontSize: 11, color: C.tealDk, marginTop: 2 }}>{u.specialite} · {u.ville}</div>}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: u.role === "secretaire" ? C.tealLt : "#EEF2FF",
                color: roleColors[u.role],
              }}>
                {roleLabels[u.role]}
              </span>

              {/* Change Password button */}
              <button
                onClick={() => { setPwdModal(u); setNewPwd(""); setPwdErr(""); setPwdSuccess(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                  borderRadius: 8, border: `1px solid ${C.tealDk}33`, background: C.tealLt,
                  color: C.tealDk, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", flexShrink: 0,
                }}>
                <KeyRound size={13} /> {isMobile ? "" : "Password"}
              </button>

              {/* Delete button */}
              <button
                onClick={() => { setConfirm(u); setErr(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                  borderRadius: 8, border: `1px solid ${C.red}22`, background: C.redLt,
                  color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", flexShrink: 0,
                }}>
                <Trash2 size={13} /> {isMobile ? "" : "Delete"}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* ── Change Password Modal ─────────────────────────────────────────────── */}
      {pwdModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 500, padding: 20,
        }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound size={22} color={C.tealDk} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Change Password</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>Set a new password for this account</div>
              </div>
            </div>

            <div style={{ background: C.gray50, borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: C.navy }}>{pwdModal.prenom} {pwdModal.nom}</div>
              <div style={{ fontSize: 12, color: C.gray500 }}>{pwdModal.email} · {roleLabels[pwdModal.role]}</div>
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
              New Password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => { setNewPwd(e.target.value); setPwdErr(""); setPwdSuccess(""); }}
              placeholder="Minimum 8 characters"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 9,
                border: `1.5px solid ${pwdErr ? C.red : C.border}`,
                fontSize: 13, color: C.navy, outline: "none",
                fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = pwdErr ? C.red : C.border)}
              onKeyDown={(e) => e.key === "Enter" && changePassword()}
            />

            {pwdErr && (
              <div style={{ background: C.redLt, color: C.red, borderRadius: 8, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                {pwdErr.split('\n').map((line, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < pwdErr.split('\n').length - 1 ? 4 : 0 }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} /> {line}
                  </div>
                ))}
              </div>
            )}
            {pwdSuccess && (
              <div style={{ background: "#ECFDF5", color: "#065F46", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                ✓ {pwdSuccess}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setPwdModal(null); setNewPwd(""); setPwdErr(""); setPwdSuccess(""); }}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.gray500, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button
                onClick={changePassword}
                disabled={pwdLoading}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.tealDk, color: "#fff", fontWeight: 700, fontSize: 14, cursor: pwdLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: pwdLoading ? 0.7 : 1 }}>
                <KeyRound size={15} /> {pwdLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {confirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 500, padding: 20,
        }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.redLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={22} color={C.red} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Confirm Deletion</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>This action is irreversible</div>
              </div>
            </div>
            <div style={{ background: C.gray50, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: C.navy }}>{confirm.prenom} {confirm.nom}</div>
              <div style={{ fontSize: 12, color: C.gray500 }}>{confirm.email} · {roleLabels[confirm.role]}</div>
            </div>
            {err && (
              <div style={{ background: C.redLt, color: C.red, borderRadius: 8, padding: "9px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                {err}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, color: C.gray500, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirm)}
                disabled={deleting}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700, fontSize: 14, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};