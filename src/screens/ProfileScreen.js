import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { logout, loginSuccess } from '../store/slices/authSlice';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import apiClient from '../api/client';
import MapAddressPicker from '../components/MapAddressPicker';

// ─── Validation helpers ───────────────────────────────────────────────────────

const isValidPersonName = (v) => /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 0;
const isValidLocalPhone = (v) => /^\d{9}$/.test(v);

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '#94a3b8' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = {
    1: { label: 'Weak',   color: '#ef4444' },
    2: { label: 'Fair',   color: '#f59e0b' },
    3: { label: 'Good',   color: '#10b981' },
    4: { label: 'Strong', color: '#6366f1' },
  };
  return { score, ...(map[score] ?? { label: '', color: '#94a3b8' }) };
};

const getPasswordErrors = (pw) => {
  const e = [];
  if (!pw || pw.length < 8)             e.push('At least 8 characters');
  if (!pw || !/[A-Z]/.test(pw))         e.push('At least 1 uppercase letter');
  if (!pw || !/[0-9]/.test(pw))         e.push('At least 1 number');
  if (!pw || !/[^A-Za-z0-9]/.test(pw))  e.push('At least 1 special character');
  return e;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stripPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('94') && d.length === 11) return d.slice(2);
  if (d.startsWith('0')  && d.length === 10) return d.slice(1);
  return d.slice(0, 9);
};

const formatPhoneDisplay = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('94') && d.length === 11) return `+94 ${d.slice(2)}`;
  if (d.startsWith('0')  && d.length === 10) return `+94 ${d.slice(1)}`;
  if (d.length === 9) return `+94 ${d}`;
  return raw;
};

const getRoleBadge = (role) => ({
  buyer:       { label: 'Buyer',       color: '#10b981' },
  seller:      { label: 'Seller',      color: '#6366f1' },
  driver:      { label: 'Driver',      color: '#f59e0b' },
  field_admin: { label: 'Field Admin', color: '#0ea5e9' },
}[role] ?? { label: role, color: '#94a3b8' });

// ─── Role-based menu config ───────────────────────────────────────────────────
// NOTE: 'field_admin' is a mobile-only role (travels with drivers in the field).
// It is distinct from the web app's platform-level 'admin' role, which does not
// exist on mobile. Field admins see the same Vehicle / Availability sections as
// drivers, but in read-only oversight mode.

const getMenuItems = (role) => {
  const edit          = { id: 'edit',          icon: 'person-outline',           title: 'Edit Profile',      desc: 'Update your name and phone number'    };
  const password      = { id: 'password',      icon: 'lock-closed-outline',      title: 'Change Password',   desc: 'Update your account password'         };
  const notifications = { id: 'notifications', icon: 'notifications-outline',    title: 'Notifications',     desc: 'Control alerts and reminders'         };
  const help          = { id: 'help',          icon: 'help-circle-outline',      title: 'Help & Support',    desc: 'Get support or contact us'            };
  const terms         = { id: 'terms',         icon: 'document-text-outline',    title: 'Terms & Privacy',   desc: 'Privacy policy and terms of service'  };
  const danger         = { id: 'danger',        icon: 'warning-outline',          title: 'Danger Zone',       desc: 'Delete your account permanently'      };
  const reviews        = { id: 'reviews',       icon: 'star-outline',             title: 'My Reviews',        desc: 'Reviews you have submitted'           };

  if (role === 'buyer') return [
    edit,
    password,
    { id: 'address',  icon: 'location-outline', title: 'Delivery Addresses', desc: 'Manage your saved delivery locations' },
    reviews,
    notifications,
    help,
    terms,
    danger,
  ];

  if (role === 'seller') return [
    edit,
    password,
    { id: 'business', icon: 'storefront-outline', title: 'Business Info',   desc: 'Update your business name and address' },
    { id: 'reviews',  icon: 'star-outline',       title: 'Product Reviews', desc: 'Customer feedback on your products'    },
    notifications,
    help,
    terms,
    danger,
  ];

  if (role === 'driver' || role === 'field_admin') {
    const isFieldAdmin = role === 'field_admin';
    return [
      edit,
      password,
      {
        id: 'vehicle', icon: 'car-sport-outline', title: 'Vehicle Info',
        desc: isFieldAdmin ? 'Assigned vehicle details (view only)' : 'Your registered vehicle details',
      },
      {
        id: 'availability', icon: 'calendar-outline', title: 'Availability',
        desc: isFieldAdmin ? 'Driver availability overview (view only)' : 'Set your active delivery hours',
      },
      { id: 'reviews', icon: 'star-outline', title: 'My Reviews', desc: 'Reviews buyers left about your deliveries' },
      notifications,
      help,
      terms,
      danger,
    ];
  }

  // fallback
  return [edit, password, notifications, help, terms, danger];
};

// ─── Shared field components ──────────────────────────────────────────────────

const Lbl = ({ text, theme }) => (
  <Text style={[sh.label, { color: theme.colors.text.secondary }]}>{text}</Text>
);

const Fld = ({ value, onChange, placeholder, theme, keyboardType, maxLength, multiline, secureTextEntry, autoCapitalize, editable = true }) => (
  <TextInput
    style={[
      sh.input,
      { color: theme.colors.text.primary, borderColor: theme.colors.border },
      multiline && { height: 80, textAlignVertical: 'top' },
      !editable && { opacity: 0.5 },
    ]}
    value={value}
    onChangeText={onChange}
    placeholder={placeholder}
    placeholderTextColor={theme.colors.text.tertiary}
    keyboardType={keyboardType}
    maxLength={maxLength}
    multiline={multiline}
    secureTextEntry={secureTextEntry}
    autoCapitalize={autoCapitalize ?? 'sentences'}
    editable={editable}
  />
);

const ErrTxt = ({ msg }) => msg ? <Text style={sh.errTxt}>{msg}</Text> : null;
const OkTxt  = ({ msg }) => msg ? <Text style={sh.okTxt}>{msg}</Text>  : null;

const PrimaryBtn = ({ label, onPress, disabled, theme }) => (
  <TouchableOpacity
    style={[sh.primaryBtn, { backgroundColor: theme.colors.primary.main }, disabled && { opacity: 0.55 }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {disabled
      ? <ActivityIndicator color="#fff" />
      : <Text style={sh.primaryBtnTxt}>{label}</Text>
    }
  </TouchableOpacity>
);

const OutlineBtn = ({ label, onPress, theme }) => (
  <TouchableOpacity
    style={[sh.outlineBtn, { borderColor: theme.colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[sh.outlineBtnTxt, { color: theme.colors.text.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const ToggleRow = ({ label, sub, value, onChange, theme, disabled }) => (
  <Card style={sh.toggleCard}>
    <View style={sh.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[sh.toggleTitle, { color: theme.colors.text.primary }]}>{label}</Text>
        {sub ? <Text style={[sh.toggleSub, { color: theme.colors.text.secondary }]}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        thumbColor="#fff"
        trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
      />
    </View>
  </Card>
);

const StarRow = ({ rating, size = 16, editable = false, onChange }) => (
  <View style={{ flexDirection: 'row', gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => {
      const filled = rating >= s;
      const star = (
        <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color="#fbbf24" />
      );
      return editable ? (
        <TouchableOpacity key={s} onPress={() => onChange(s)}>{star}</TouchableOpacity>
      ) : <View key={s}>{star}</View>;
    })}
  </View>
);

// ─── SECTION: Edit Profile ────────────────────────────────────────────────────

const EditSection = ({ user, theme, dispatch, token, role }) => {
  const [name,   setName]   = useState(user?.name  ?? '');
  const [phone,  setPhone]  = useState(stripPhone(user?.phone ?? ''));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (name.trim() && !isValidPersonName(name)) e.name  = 'Only letters and spaces allowed';
    if (phone && !isValidLocalPhone(phone))       e.phone = 'Phone must be exactly 9 digits';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/profile/personal', {
        name:  name.trim()  || undefined,
        phone: phone        || undefined,
      });
      dispatch(loginSuccess({ user: { ...user, ...data.user }, token }));
      Alert.alert('Done ✓', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        <Lbl text={role === 'seller' ? 'Owner name' : 'Full name'} theme={theme} />
        <Fld
          value={name}
          onChange={(t) => { setName(t.replace(/[^A-Za-z\s]/g, '')); setErrors((p) => ({ ...p, name: '' })); }}
          placeholder="Your full name"
          theme={theme}
          autoCapitalize="words"
        />
        <ErrTxt msg={errors.name} />

        <Lbl text="Email address" theme={theme} />
        <Fld value={user?.email ?? ''} placeholder="Email" theme={theme} editable={false} />
        <Text style={[sh.hintTxt, { color: theme.colors.text.tertiary }]}>Email cannot be changed here.</Text>

        <Lbl text="Phone number" theme={theme} />
        <View style={sh.phoneRow}>
          <Text style={[sh.phonePrefix, { color: theme.colors.text.secondary }]}>🇱🇰 +94</Text>
          <Fld
            value={phone}
            onChange={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 9)); setErrors((p) => ({ ...p, phone: '' })); }}
            placeholder="771234567"
            theme={theme}
            keyboardType="phone-pad"
            maxLength={9}
            autoCapitalize="none"
          />
        </View>
        <ErrTxt msg={errors.phone} />
        {phone.length === 9 && isValidLocalPhone(phone) && <OkTxt msg={`✓ +94${phone}`} />}

      </Card>
      <PrimaryBtn label="Save changes" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Change Password ─────────────────────────────────────────────────

const PasswordSection = ({ theme }) => {
  const [fields,  setFields]  = useState({ current: '', newPw: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [visible, setVisible] = useState({ current: false, newPw: false, confirm: false });

  const strength  = useMemo(() => getPasswordStrength(fields.newPw), [fields.newPw]);
  const pwdErrors = useMemo(() => getPasswordErrors(fields.newPw),   [fields.newPw]);

  const update  = (key, val) => { setFields((p) => ({ ...p, [key]: val })); setErrors((p) => ({ ...p, [key]: '' })); };
  const touchFn = (key) => setTouched((p) => ({ ...p, [key]: true }));

  const validate = () => {
    const e = {};
    if (!fields.current)                 e.current = 'Current password is required';
    if (pwdErrors.length > 0)            e.newPw   = pwdErrors[0];
    if (fields.newPw !== fields.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSave = async () => {
    setTouched({ current: true, newPw: true, confirm: true });
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await apiClient.patch('/profile/password', {
        currentPassword: fields.current,
        newPassword: fields.newPw,
      });
      Alert.alert('Done ✓', 'Password changed successfully.');
      setFields({ current: '', newPw: '', confirm: '' });
      setTouched({});
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to change password');
    } finally { setSaving(false); }
  };

  const rows = [
    { key: 'current', label: 'Current password',  placeholder: 'Enter current password',   vis: 'current' },
    { key: 'newPw',   label: 'New password',       placeholder: 'At least 8 characters',    vis: 'newPw'   },
    { key: 'confirm', label: 'Confirm password',   placeholder: 'Repeat your new password', vis: 'confirm' },
  ];

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        {rows.map(({ key, label, placeholder, vis }) => (
          <View key={key}>
            <Lbl text={label} theme={theme} />
            <View style={sh.pwFieldWrap}>
              <TextInput
                style={[
                  sh.input, sh.pwInputFull,
                  { color: theme.colors.text.primary, borderColor: touched[key] && errors[key] ? '#ef4444' : theme.colors.border },
                ]}
                value={fields[key]}
                onChangeText={(t) => update(key, t)}
                onBlur={() => touchFn(key)}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry={!visible[vis]}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setVisible((p) => ({ ...p, [vis]: !p[vis] }))} style={sh.eyeBtnInside}>
                <Ionicons name={visible[vis] ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {key === 'newPw' && fields.newPw.length > 0 && (
              <View style={sh.strengthRow}>
                <View style={sh.strengthBg}>
                  <View style={[sh.strengthBar, { width: `${strength.score * 25}%`, backgroundColor: strength.color }]} />
                </View>
                <Text style={[sh.strengthTxt, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
            {key === 'newPw' && touched.newPw && pwdErrors.length > 0 && pwdErrors.map((e) => <ErrTxt key={e} msg={`✕ ${e}`} />)}
            {key === 'newPw' && touched.newPw && pwdErrors.length === 0 && fields.newPw && <OkTxt msg="✓ Password looks great!" />}
            {key !== 'newPw' && <ErrTxt msg={touched[key] && errors[key] ? errors[key] : ''} />}
            {key === 'confirm' && fields.confirm && fields.newPw === fields.confirm && <OkTxt msg="✓ Passwords match" />}
          </View>
        ))}
      </Card>
      <PrimaryBtn label="Change password" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Saved Address Manager (buyer delivery addresses / seller locations) ──
// Mirrors the web app's multi-address model: a list of saved addresses with
// label, address, city, coordinates, and a single default. Backed by
// /profile/addresses (list/create), /profile/addresses/:id (update/delete),
// and /profile/addresses/:id/default (set default).

const AddressListManager = ({ theme, addLabel = '+ Add address' }) => {
  const [addresses,  setAddresses]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editingId,  setEditingId]  = useState(null); // null | 'new' | id
  const [label,      setLabel]      = useState('');
  const [location,   setLocation]   = useState({ address: '', city: '', lat: null, lng: null });
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/addresses');
        setAddresses(data.addresses ?? []);
      } catch { /* show empty */ } finally { setLoading(false); }
    })();
  }, []);

  const openAdd = () => {
    setEditingId('new');
    setLabel('');
    setLocation({ address: '', city: '', lat: null, lng: null });
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setLabel(a.label ?? '');
    setLocation({ address: a.address ?? '', city: a.city ?? '', lat: a.lat ?? null, lng: a.lng ?? null });
  };

  const cancel = () => setEditingId(null);

  const handleSave = async () => {
    if (!location.address.trim()) { Alert.alert('Required', 'Please select an address.'); return; }
    setSaving(true);
    try {
      const payload = {
        label: label.trim() || 'Address',
        address: location.address,
        city: location.city,
        latitude: location.lat,
        longitude: location.lng,
      };
      if (editingId === 'new') {
        const { data } = await apiClient.post('/profile/addresses', payload);
        setAddresses((prev) => [
          ...prev,
          data?.address ?? { id: `tmp-${Date.now()}`, ...payload, lat: payload.latitude, lng: payload.longitude, isDefault: prev.length === 0 },
        ]);
        Alert.alert('Done ✓', 'Address added.');
      } else {
        await apiClient.patch(`/profile/addresses/${editingId}`, payload);
        setAddresses((prev) => prev.map((a) => a.id === editingId
          ? { ...a, label: payload.label, address: payload.address, city: payload.city, lat: payload.latitude, lng: payload.longitude }
          : a));
        Alert.alert('Done ✓', 'Address updated.');
      }
      setEditingId(null);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = (a) => {
    Alert.alert('Remove address', `Remove "${a.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/profile/addresses/${a.id}`);
            setAddresses((prev) => prev.filter((x) => x.id !== a.id));
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to remove address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (a) => {
    try {
      await apiClient.patch(`/profile/addresses/${a.id}/default`);
      setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === a.id })));
    } catch {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  if (loading) return <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>;

  return (
    <View style={sh.group}>
      {addresses.length === 0 && editingId === null && (
        <Card style={sh.emptyCard}>
          <Ionicons name="location-outline" size={36} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>No addresses saved yet.</Text>
        </Card>
      )}

      {addresses.map((a) => (
        <Card key={a.id} style={sh.infoCard}>
          <View style={sh.cardRow}>
            <View style={{ flex: 1 }}>
              <View style={sh.addrLabelRow}>
                <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{a.label}</Text>
                {a.isDefault && (
                  <View style={sh.defaultPill}><Text style={sh.defaultPillTxt}>Default</Text></View>
                )}
              </View>
              <Text style={[sh.cardText, { color: theme.colors.text.secondary }]}>
                {a.address}{a.city ? `, ${a.city}` : ''}
              </Text>
            </View>
          </View>
          <View style={sh.addrActionsRow}>
            {!a.isDefault && (
              <TouchableOpacity onPress={() => handleSetDefault(a)}>
                <Text style={sh.linkTxt}>Set default</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => openEdit(a)}>
              <Text style={sh.linkTxt}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(a)}>
              <Text style={sh.deleteTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {editingId !== null ? (
        <Card style={sh.formCard}>
          <Lbl text="Label" theme={theme} />
          <Fld value={label} onChange={setLabel} placeholder="Home, Work, Store, etc." theme={theme} />
          <Lbl text="Full address" theme={theme} />
          <MapAddressPicker
            initialLat={location.lat}
            initialLng={location.lng}
            onChange={setLocation}
            theme={theme}
          />
          <PrimaryBtn label={editingId === 'new' ? 'Add address' : 'Save changes'} onPress={handleSave} disabled={saving} theme={theme} />
          <OutlineBtn label="Cancel" onPress={cancel} theme={theme} />
        </Card>
      ) : (
        <OutlineBtn label={addLabel} onPress={openAdd} theme={theme} />
      )}
    </View>
  );
};

// ─── SECTION: Delivery Addresses (buyer) ─────────────────────────────────────

const AddressSection = ({ theme }) => (
  <AddressListManager theme={theme} addLabel="+ Add address" />
);

// ─── SECTION: Business Info (seller) ─────────────────────────────────────────

const BusinessSection = ({ user, theme, dispatch, token }) => {
  const [location, setLocation] = useState({
    address: user?.businessAddress ?? '',
    city: user?.city ?? '',
    lat: user?.businessLat ?? null,
    lng: user?.businessLng ?? null,
  });
  const [bizName, setBizName] = useState(user?.businessName ?? '');
  const [saving,  setSaving]  = useState(false);

  const [products,        setProducts]        = useState([]);
  const [productsLoading, setProductsLoading]  = useState(true);
  const [statsData,       setStatsData]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/products');
        setProducts(data.products ?? []);
      } catch { /* show empty */ } finally { setProductsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/stats');
        setStatsData(data.stats ?? null);
      } catch { /* show fallback */ }
    })();
  }, []);

  const handleSave = async () => {
    if (!bizName.trim())            { Alert.alert('Required', 'Business name is required.');    return; }
    if (!location.address.trim())   { Alert.alert('Required', 'Business address is required.'); return; }
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/profile/business', {
        businessName:    bizName.trim(),
        businessAddress: location.address,
        city:            location.city,
        latitude:        location.lat,
        longitude:       location.lng,
      });
      dispatch(loginSuccess({ user: { ...user, ...data.user }, token }));
      Alert.alert('Done ✓', 'Business info updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update business info');
    } finally { setSaving(false); }
  };

  const productStatusStyle = (status) => status === 'PENDING_APPROVAL'
    ? { color: '#f59e0b', label: 'Pending' }
    : { color: '#10b981', label: 'Approved' };

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        <Lbl text="Business name" theme={theme} />
        <Fld value={bizName} onChange={setBizName} placeholder="Your business name" theme={theme} />
      </Card>

      <MapAddressPicker
        initialLat={location.lat}
        initialLng={location.lng}
        onChange={setLocation}
        theme={theme}
      />

      <PrimaryBtn label="Save business info" onPress={handleSave} disabled={saving} theme={theme} />

      {/* Additional saved locations */}
      <View>
        <Text style={[sh.sectionLabel, { color: theme.colors.text.primary }]}>Other Locations</Text>
        <AddressListManager theme={theme} addLabel="+ Add location" />
      </View>

      {/* Your Products */}
      <View>
        <Text style={[sh.sectionLabel, { color: theme.colors.text.primary }]}>Your Products</Text>
        {productsLoading ? (
          <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>
        ) : products.length === 0 ? (
          <Card style={sh.emptyCard}>
            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No products listed yet.</Text>
          </Card>
        ) : (
          products.map((p) => {
            const st = productStatusStyle(p.status);
            return (
              <Card key={p.name} style={sh.infoCard}>
                <View style={sh.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{p.name}</Text>
                    <Text style={[sh.cardText, { color: theme.colors.text.secondary }]}>{p.price}</Text>
                  </View>
                  <View style={[sh.statusPill, { borderColor: `${st.color}40`, backgroundColor: `${st.color}20` }]}>
                    <Text style={{ color: st.color, fontSize: 12, fontWeight: '600' }}>{st.label}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Earnings Summary */}
      <Card style={sh.formCard}>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Earnings Summary</Text>
        <View style={sh.earningsGrid}>
          {[
            { label: 'This month',     value: statsData?.thisMonth     ?? '—' },
            { label: 'Last month',     value: statsData?.lastMonth     ?? '—' },
            { label: 'Total orders',   value: statsData?.totalOrders != null ? String(statsData.totalOrders) : '—' },
            { label: 'Pending payout', value: statsData?.pendingPayout ?? '—' },
          ].map((e) => (
            <View key={e.label} style={sh.earningsCell}>
              <Text style={[sh.earningsValue, { color: theme.colors.text.primary }]}>{e.value}</Text>
              <Text style={[sh.earningsLabel, { color: theme.colors.text.secondary }]}>{e.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
};

// ─── SECTION: Vehicle Info (driver / field admin read-only) ─────────────────

const VehicleSection = ({ user, theme, readOnly = false }) => {
  const [vehicleType,  setVehicleType]  = useState(user?.vehicleType  ?? '');
  const [plateNumber,  setPlateNumber]  = useState(user?.plateNumber  ?? '');
  const [vehicleModel, setVehicleModel] = useState(user?.vehicleModel ?? '');
  const [saving,       setSaving]       = useState(false);

  const handleSave = async () => {
    if (!plateNumber.trim()) { Alert.alert('Required', 'Plate number is required.'); return; }
    setSaving(true);
    try {
      await apiClient.patch('/profile/vehicle', {
        vehicleType:  vehicleType.trim()  || undefined,
        plateNumber:  plateNumber.trim(),
        vehicleModel: vehicleModel.trim() || undefined,
      });
      Alert.alert('Done ✓', 'Vehicle info updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update vehicle info');
    } finally { setSaving(false); }
  };

  return (
    <View style={sh.group}>
      {readOnly && (
        <View style={sh.readOnlyBanner}>
          <Ionicons name="eye-outline" size={16} color="#94a3b8" />
          <Text style={sh.readOnlyBannerTxt}>View only — field admins cannot edit vehicle details.</Text>
        </View>
      )}
      <Card style={sh.formCard}>
        <Lbl text="Vehicle type"  theme={theme} />
        <Fld value={vehicleType}  onChange={setVehicleType}  placeholder="e.g. Motorbike, Van" theme={theme} editable={!readOnly} />
        <Lbl text="Plate number"  theme={theme} />
        <Fld value={plateNumber}  onChange={setPlateNumber}  placeholder="e.g. CAB-1234"       theme={theme} autoCapitalize="characters" editable={!readOnly} />
        <Lbl text="Vehicle model" theme={theme} />
        <Fld value={vehicleModel} onChange={setVehicleModel} placeholder="e.g. Honda CB150"   theme={theme} editable={!readOnly} />
      </Card>
      {!readOnly && <PrimaryBtn label="Save vehicle info" onPress={handleSave} disabled={saving} theme={theme} />}
    </View>
  );
};

// ─── SECTION: Availability (driver / field admin read-only) ─────────────────

const AvailabilitySection = ({ theme, readOnly = false }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [mon, setMon] = useState(true);
  const [tue, setTue] = useState(true);
  const [wed, setWed] = useState(true);
  const [thu, setThu] = useState(true);
  const [fri, setFri] = useState(true);
  const [sat, setSat] = useState(false);
  const [sun, setSun] = useState(false);

  const days = [
    { label: 'Monday',    value: mon, set: setMon },
    { label: 'Tuesday',   value: tue, set: setTue },
    { label: 'Wednesday', value: wed, set: setWed },
    { label: 'Thursday',  value: thu, set: setThu },
    { label: 'Friday',    value: fri, set: setFri },
    { label: 'Saturday',  value: sat, set: setSat },
    { label: 'Sunday',    value: sun, set: setSun },
  ];

  return (
    <View style={sh.group}>
      {readOnly && (
        <View style={sh.readOnlyBanner}>
          <Ionicons name="eye-outline" size={16} color="#94a3b8" />
          <Text style={sh.readOnlyBannerTxt}>View only — showing driver availability for oversight.</Text>
        </View>
      )}
      <ToggleRow
        label="Available for deliveries"
        sub="Turn off to go offline"
        value={isAvailable}
        onChange={() => setIsAvailable((p) => !p)}
        theme={theme}
        disabled={readOnly}
      />
      <Card style={sh.formCard}>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Active days</Text>
        {days.map((d) => (
          <View key={d.label} style={[sh.toggleRow, { marginBottom: 8 }]}>
            <Text style={[sh.toggleTitle, { color: theme.colors.text.primary, flex: 1 }]}>{d.label}</Text>
            <Switch
              value={d.value}
              onValueChange={d.set}
              disabled={readOnly}
              thumbColor="#fff"
              trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
            />
          </View>
        ))}
      </Card>
    </View>
  );
};

// ─── SECTION: Reviews ─────────────────────────────────────────────────────────

const ReviewsSection = ({ role, theme, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId,  setEditId]  = useState(null);
  const [draft,   setDraft]   = useState({ rating: 5, comment: '' });

  useEffect(() => {
    (async () => {
      try {
        if (role === 'buyer') {
          const { data } = await apiClient.get('/rating/my');
          setReviews(data);
        } else if (role === 'seller') {
          const { data } = await apiClient.get('/rating/my-seller-ratings');
          setReviews(data.ratings ?? []);
        } else if (role === 'driver' || role === 'field_admin') {
          // no "my ratings" endpoint for drivers yet — hits the public
          // /rating/driver/:driverId route directly using the driver's own id.
          // TODO confirm this is the right field on `user`.
          const driverId = user?.driverId ?? user?.driver?.id;
          if (!driverId) { setReviews([]); return; }
          const { data } = await apiClient.get(`/rating/driver/${driverId}`);
          setReviews(data ?? []); // this endpoint returns a raw array, not { ratings: [...] }
        }
      } catch { /* show empty */ } finally { setLoading(false); }
    })();
  }, [role, user?.driverId]);


  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/rating/${id}`);
      setReviews((p) => p.filter((r) => r.id !== id));
      Alert.alert('Done ✓', 'Review deleted.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete');
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await apiClient.patch(`/rating/${id}`, { ratings: { overall: draft.rating }, comment: draft.comment });
      setReviews((p) => p.map((r) => r.id === id ? { ...r, rating: draft.rating, comment: draft.comment } : r));
      setEditId(null);
      Alert.alert('Done ✓', 'Review updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update');
    }
  };

  const handleFlag = async (id) => {
    try {
      await apiClient.post(`/rating/${id}/flag`);
      setReviews((p) => p.map((r) => r.id === id ? { ...r, isFlagged: true } : r));
    } catch {
      Alert.alert('Error', 'Failed to flag review');
    }
  };

  if (loading) return <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>;

  if (!reviews.length) return (
    <Card style={sh.emptyCard}>
      <Ionicons name="star-outline" size={36} color="#94a3b8" />
      <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>No reviews yet.</Text>
    </Card>
  );

  return (
    <View style={sh.group}>
      {reviews.map((r) => {
        const canEdit = role === 'buyer' && (Date.now() - new Date(r.createdAt).getTime()) / 3600000 <= 24;
        return (
          <Card key={r.id} style={{ marginBottom: 4 }}>
            <View style={sh.reviewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={sh.reviewProduct}>{r.product?.name ?? r.productName ?? 'Product'}</Text>
                {r.order?.orderNumber && <Text style={sh.reviewMeta}>#{r.order.orderNumber}</Text>}
                {(role === 'seller' || role === 'driver' || role === 'field_admin') && r.buyer?.user?.name && (<Text style={sh.reviewMeta}>by {r.buyer.user.name}</Text>)}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {canEdit && editId !== r.id && (
                  <TouchableOpacity onPress={() => { setEditId(r.id); setDraft({ rating: r.rating, comment: r.comment ?? '' }); }} style={sh.inlineActionRow}>
                    <Ionicons name="pencil-outline" size={12} color="#10b981" />
                    <Text style={sh.editTxt}>Edit</Text>
                  </TouchableOpacity>
                )}
                {canEdit && (
                  <TouchableOpacity onPress={() => handleDelete(r.id)} style={sh.inlineActionRow}>
                    <Ionicons name="close-outline" size={12} color="#ef4444" />
                    <Text style={sh.deleteTxt}>Delete</Text>
                  </TouchableOpacity>
                )}
                {(role === 'seller' || role === 'driver' || role === 'field_admin') && !r.isFlagged && (
                  <TouchableOpacity onPress={() => handleFlag(r.id)} style={sh.inlineActionRow}>
                    <Ionicons name="flag-outline" size={12} color="#94a3b8" />
                    <Text style={sh.flagTxt}>Flag</Text>
                  </TouchableOpacity>
                )}
                {r.isFlagged && (
                  <View style={sh.inlineActionRow}>
                    <Ionicons name="flag" size={12} color="#f59e0b" />
                    <Text style={sh.flaggedTxt}>Flagged</Text>
                  </View>
                )}
              </View>
            </View>
            {editId === r.id ? (
              <View style={{ marginTop: 10, gap: 8 }}>
                <StarRow rating={draft.rating} size={22} editable onChange={(s) => setDraft((p) => ({ ...p, rating: s }))} />
                <TextInput
                  style={[sh.input, { color: '#f1f5f9', borderColor: '#334155', height: 70, textAlignVertical: 'top' }]}
                  value={draft.comment}
                  onChangeText={(t) => setDraft((p) => ({ ...p, comment: t }))}
                  placeholder="Update your comment"
                  placeholderTextColor="#64748b"
                  multiline
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[sh.smallBtn, { borderColor: '#10b981' }]} onPress={() => handleSaveEdit(r.id)}>
                    <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[sh.smallBtn, { borderColor: '#475569' }]} onPress={() => setEditId(null)}>
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <StarRow rating={r.rating} size={16} />
                {r.comment ? <Text style={sh.reviewComment}>"{r.comment}"</Text> : null}
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
};

// ─── SECTION: Notifications ───────────────────────────────────────────────────
// Backed by /profile/notification-prefs (GET to load, PATCH to save one key at
// a time). Keys per role must match the backend's DEFAULT_PREFS in
// profile.service.ts: buyer -> orderUpdates/lowStock, seller ->
// newOrders/payouts/lowStock, driver & field_admin -> newRoutes/orderUpdates.
// Missing keys default to "on" so nothing looks off before the fetch resolves.

const NotificationsSection = ({ theme, role }) => {
  const [prefs, setPrefs]     = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/notification-prefs');
        setPrefs(data.prefs ?? {});
      } catch { /* fall back to empty — toggles default to "on" below */ }
      finally { setLoading(false); }
    })();
  }, []);

  const toggle = async (key) => {
    const previous = prefs;
    const next     = { ...prefs, [key]: !prefs[key] };
    setPrefs(next); // optimistic update

    try {
      await apiClient.patch('/profile/notification-prefs', { prefs: { [key]: next[key] } });
    } catch {
      setPrefs(previous); // revert on failure
      Alert.alert('Error', 'Failed to update notification preference');
    }
  };

  const toggles =
    role === 'buyer' ? [
      { key: 'orderUpdates', label: 'Order updates',    sub: 'Delivery and pickup alerts'        },
      { key: 'lowStock',     label: 'Low stock alerts', sub: 'When your favourite items run low' },
    ] :
    role === 'seller' ? [
      { key: 'newOrders', label: 'New orders',       sub: 'When a customer places an order'  },
      { key: 'payouts',   label: 'Payout alerts',    sub: 'When earnings are transferred'    },
      { key: 'lowStock',  label: 'Low stock alerts', sub: 'When your product stock runs low' },
    ] : /* driver / field_admin */ [
      { key: 'newRoutes',    label: 'New delivery jobs', sub: 'Available routes near you'      },
      { key: 'orderUpdates', label: 'Order updates',     sub: 'Status changes on active orders' },
    ];

  if (loading) return <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>;

  return (
    <View style={sh.group}>
      {toggles.map((t) => (
        <ToggleRow
          key={t.key}
          label={t.label}
          sub={t.sub}
          value={prefs[t.key] ?? true}
          onChange={() => toggle(t.key)}
          theme={theme}
        />
      ))}
    </View>
  );
};

// ─── SECTION: Help ────────────────────────────────────────────────────────────

const HelpSection = ({ theme }) => {
  const openEmail = async () => {
    const url = 'mailto:support@freshroute.lk?subject=Support%20Request';
    const ok  = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Support', 'Email us at support@freshroute.lk');
  };
  return (
    <View style={sh.group}>
      <Card>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>Need help?</Text>
        <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4 }]}>
          Our support team is available Mon–Fri, 9am–6pm.{'\n'}support@freshroute.lk
        </Text>
      </Card>
      <OutlineBtn label="Contact support" onPress={openEmail} theme={theme} />
    </View>
  );
};

// ─── SECTION: Terms & Privacy ─────────────────────────────────────────────────

const TermsSection = ({ theme, role }) => {
  return (
    <View style={sh.group}>
      {[
        { title: 'Privacy & terms',  body: 'Your data is protected and used only to improve your FreshRoute experience.' },
        { title: 'Data use',         body: 'We use your profile details to personalize products, delivery, and support — and never share them without your consent.' },
        { title: 'Account rights',   body: 'You can edit your information, change your password, and request account deletion at any time from this profile section.' },
      ].map((item) => (
        <Card key={item.title} style={sh.infoCard}>
          <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
          <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4 }]}>{item.body}</Text>
        </Card>
      ))}
    </View>
  );
};

// ─── SECTION: Danger Zone ─────────────────────────────────────────────────────

const DangerZoneSection = ({ role, dispatch, theme }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete('/profile');
      Alert.alert('Account deleted', 'Your account has been permanently removed.');
      dispatch(logout());
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <View style={sh.group}>
      <Card style={sh.dangerCard}>
        <Text style={sh.dangerTitle}>Danger Zone</Text>
        <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4, marginBottom: 12 }]}>
          Once deleted, your account and all data will be permanently removed. This cannot be undone.
        </Text>

        {!confirming ? (
          <TouchableOpacity style={sh.dangerBtn} onPress={() => setConfirming(true)} activeOpacity={0.8}>
            <Text style={sh.dangerBtnTxt}>{role === 'seller' ? 'Delete My Store' : 'Delete My Account'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={sh.dangerConfirmTxt}>Are you sure? This cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[sh.dangerBtn, { flex: 1 }, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={sh.dangerBtnTxt}>Yes, delete it</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[sh.outlineBtn, { flex: 1 }]}
                onPress={() => setConfirming(false)}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={[sh.outlineBtnTxt, { color: theme.colors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
};

// ─── Detail view ──────────────────────────────────────────────────────────────

const DetailView = ({ section, user, theme, dispatch, token, role, onBack }) => {
  const isFieldAdmin = role === 'field_admin';

  const renderContent = () => {
    switch (section.id) {
      case 'edit':          return <EditSection         user={user} theme={theme} dispatch={dispatch} token={token} role={role} />;
      case 'password':      return <PasswordSection     theme={theme} />;
      case 'address':       return <AddressSection      theme={theme} />;
      case 'business':      return <BusinessSection     user={user} theme={theme} dispatch={dispatch} token={token} />;
      case 'vehicle':       return <VehicleSection      user={user} theme={theme} readOnly={isFieldAdmin} />;
      case 'availability':  return <AvailabilitySection theme={theme} readOnly={isFieldAdmin} />;
      case 'reviews':       return <ReviewsSection      role={role} theme={theme} user={user} />;
      case 'notifications': return <NotificationsSection theme={theme} role={role} />;
      case 'help':          return <HelpSection         theme={theme} />;
      case 'terms':         return <TermsSection        theme={theme} role={role} />;
      case 'danger':        return <DangerZoneSection    role={role} dispatch={dispatch} theme={theme} />;
      default:              return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={ms.backBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text.primary} />
        <Text style={[ms.backLabel, { color: theme.colors.text.secondary }]}>Back to Profile</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.detailScroll}>
        <Card style={ms.heroCard}>
          <View style={[ms.iconBadge, { backgroundColor: `${theme.colors.primary.main}20` }]}>
            <Ionicons name={section.icon} size={28} color={theme.colors.primary.main} />
          </View>
          <Text style={[ms.heroTitle, { color: theme.colors.text.primary }]}>{section.title}</Text>
          <Text style={[ms.heroSub,   { color: theme.colors.text.secondary }]}>{section.desc}</Text>
        </Card>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

// ─── Main ProfileScreen ───────────────────────────────────────────────────────

const ProfileScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user, token } = useSelector((st) => st.auth);

  const [activeSection, setActiveSection] = useState(null);

  const role      = user?.role?.toLowerCase() ?? 'buyer';
  const menuItems = getMenuItems(role);
  const badge     = getRoleBadge(role);

  const displayName  = user?.name  || 'User';
  const displayEmail = user?.email || '';
  const displayPhone = formatPhoneDisplay(user?.phone ?? '');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  // ── Detail view ──
  if (activeSection) {
    return (
      <View style={[ms.container, { backgroundColor: theme.colors.background }]}>
        <DetailView
          section={activeSection}
          user={user}
          theme={theme}
          dispatch={dispatch}
          token={token}
          role={role}
          onBack={() => setActiveSection(null)}
        />
      </View>
    );
  }

  // ── Menu (home) view ──
  return (
    <View style={[ms.container, { backgroundColor: theme.colors.background }]}>
      <View style={ms.header}>
        <Text style={[ms.headerTitle, { color: theme.colors.text.primary }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.scrollContent}>

        {/* User card */}
        <Card style={ms.userCard}>
          <Avatar name={displayName} size="large" />
          <View style={[ms.rolePill, { backgroundColor: `${badge.color}20`, borderColor: `${badge.color}40` }]}>
            <Text style={[ms.roleText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Text style={[ms.userName,  { color: theme.colors.text.primary }]}>{displayName}</Text>
          <Text style={[ms.userEmail, { color: theme.colors.text.secondary }]}>{displayEmail}</Text>
          {displayPhone ? <Text style={[ms.userPhone, { color: theme.colors.text.tertiary }]}>{displayPhone}</Text> : null}
        </Card>

        {/* Theme toggle */}
        <Card style={ms.themeCard}>
          <View style={ms.themeRow}>
            <View style={ms.themeInfo}>
              <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={26} color={isDarkMode ? '#facc15' : '#f59e0b'} style={{ marginRight: 16 }} />
              <View>
                <Text style={[ms.themeTitle, { color: theme.colors.text.primary }]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
                <Text style={[ms.themeSub,   { color: theme.colors.text.secondary }]}>Toggle app appearance</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Menu items */}
        <View style={ms.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => setActiveSection(item)} activeOpacity={0.7}>
              <Card style={ms.menuItem}>
                <View style={ms.menuItemContent}>
                  <View style={[ms.menuIconBox, { backgroundColor: `${theme.colors.primary.main}15` }]}>
                    <Ionicons name={item.icon} size={20} color={theme.colors.primary.main} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.menuTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
                    <Text style={[ms.menuSub,   { color: theme.colors.text.secondary }]}>{item.desc}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[ms.logoutBtn, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={ms.logoutTxt}>Logout</Text>
        </TouchableOpacity>

        <Text style={[ms.version, { color: theme.colors.text.tertiary }]}>FreshRoute v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

// ─── Shared styles (sections) ─────────────────────────────────────────────────

const sh = StyleSheet.create({
  group:    { gap: 12 },
  formCard: { gap: 10 },
  infoCard: { gap: 4 },
  label:    { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  hintTxt:  { fontSize: 11, marginTop: 2 },
  input:    { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errTxt:   { color: '#f87171', fontSize: 12, marginTop: 2 },
  okTxt:    { color: '#10b981', fontSize: 12, marginTop: 2 },

  phoneRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phonePrefix: { fontSize: 14, fontWeight: '600', paddingHorizontal: 6 },

  pwFieldWrap:  { position: 'relative', justifyContent: 'center' },
  pwInputFull:  { paddingRight: 44 },
  eyeBtnInside: { position: 'absolute', right: 12, padding: 4 },
  strengthRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 2 },
  strengthBg:   { flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  strengthBar:  { height: 6, borderRadius: 999 },
  strengthTxt:  { fontSize: 12, fontWeight: '600' },

  primaryBtn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  outlineBtn:    { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  outlineBtnTxt: { fontSize: 15, fontWeight: '600' },

  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardText:  { fontSize: 14 },
  deleteTxt: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

  toggleCard:  { paddingVertical: 14 },
  toggleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleSub:   { fontSize: 12, marginTop: 2 },

  dangerCard:      { borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1, backgroundColor: 'rgba(239,68,68,0.05)' },
  dangerTitle:     { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  dangerBtn:       { borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  dangerBtnTxt:    { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  dangerConfirmTxt:{ color: '#fca5a5', fontSize: 13, fontWeight: '600' },

  reviewHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reviewProduct: { fontSize: 15, fontWeight: '600', color: '#f1f5f9' },
  reviewMeta:    { fontSize: 11, color: '#64748b', fontFamily: 'monospace' },
  reviewComment: { fontSize: 13, color: '#cbd5e1', marginTop: 4, fontStyle: 'italic' },
  inlineActionRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  editTxt:       { color: '#10b981', fontSize: 12, fontWeight: '600' },
  flagTxt:       { color: '#94a3b8', fontSize: 12 },
  flaggedTxt:    { color: '#f59e0b', fontSize: 12 },
  smallBtn:      { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },

  emptyCard: { alignItems: 'center', paddingVertical: 32 },

  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  statusPill:   { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  earningsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  earningsCell: { width: '47%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, alignItems: 'center' },
  earningsValue:{ fontSize: 15, fontWeight: '700' },
  earningsLabel:{ fontSize: 11, marginTop: 2 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },

  addrLabelRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  defaultPill:     { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  defaultPillTxt:  { fontSize: 10, fontWeight: '700', color: '#10b981' },
  addrActionsRow:  { flexDirection: 'row', gap: 16, marginTop: 8 },
  linkTxt:         { color: '#38bdf8', fontSize: 13, fontWeight: '600' },

  readOnlyBanner:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(148,163,184,0.1)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  readOnlyBannerTxt: { fontSize: 12, color: '#94a3b8', flex: 1 },
});

// ─── Main screen styles ───────────────────────────────────────────────────────

const ms = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle:  { fontSize: 28, fontWeight: '700' },
  scrollContent:{ paddingBottom: 120 },

  userCard:  { alignItems: 'center', marginHorizontal: 20, marginBottom: 16, padding: 24 },
  rolePill:  { marginTop: 12, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleText:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  userName:  { fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 2 },
  userPhone: { fontSize: 13 },

  themeCard:  { marginHorizontal: 20, marginBottom: 16 },
  themeRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeInfo:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  themeTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  themeSub:   { fontSize: 13 },

  menuSection:     { marginHorizontal: 20, marginBottom: 16 },
  menuItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 16 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconBox:     { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTitle:       { fontSize: 15, fontWeight: '600' },
  menuSub:         { fontSize: 12, marginTop: 2 },

  logoutBtn: { marginHorizontal: 20, marginTop: 8, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  version:   { textAlign: 'center', fontSize: 12, marginVertical: 24 },

  backBtn:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, gap: 8 },
  backLabel:   { fontSize: 14 },
  detailScroll:{ paddingHorizontal: 20, paddingBottom: 60 },
  heroCard:    { alignItems: 'center', marginBottom: 16 },
  iconBadge:   { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle:   { fontSize: 18, fontWeight: '700' },
  heroSub:     { fontSize: 13, textAlign: 'center', marginTop: 4 },
});

export default ProfileScreen;