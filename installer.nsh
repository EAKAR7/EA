; Custom NSIS script for Personel Yönetim Sistemi

!macro customHeader
  !system "echo 'Personel Yönetim Sistemi Kurulum Sihirbazı'"
!macroend

!macro customInstall
  ; Create registry entries for the application
  WriteRegStr HKLM "Software\Vakif Katilim\PersonelYonetimSistemi" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Vakif Katilim\PersonelYonetimSistemi" "Version" "${VERSION}"
  
  ; Create a file association
  WriteRegStr HKCR ".pys" "" "PersonelYonetimSistemi.Database"
  WriteRegStr HKCR "PersonelYonetimSistemi.Database" "" "Personel Yönetim Sistemi Veritabanı"
  WriteRegStr HKCR "PersonelYonetimSistemi.Database\DefaultIcon" "" "$INSTDIR\Personel Yönetim Sistemi.exe,0"
  WriteRegStr HKCR "PersonelYonetimSistemi.Database\shell\open\command" "" '"$INSTDIR\Personel Yönetim Sistemi.exe" "%1"'
  
  ; Create language folders
  CreateDirectory "$INSTDIR\locales"
  
  ; Create a local settings directory for the application
  CreateDirectory "$LOCALAPPDATA\PersonelYonetimSistemi"
  CreateDirectory "$LOCALAPPDATA\PersonelYonetimSistemi\Settings"
  
  ; Create an empty settings file if it doesn't exist
  IfFileExists "$LOCALAPPDATA\PersonelYonetimSistemi\Settings\config.json" +2
  FileWrite "$LOCALAPPDATA\PersonelYonetimSistemi\Settings\config.json" "{\"language\": \"tr\", \"theme\": \"light\", \"autoUpdate\": true}"
!macroend

!macro customUnInstall
  ; Remove registry entries
  DeleteRegKey HKLM "Software\Vakif Katilim\PersonelYonetimSistemi"
  DeleteRegKey HKCR ".pys"
  DeleteRegKey HKCR "PersonelYonetimSistemi.Database"
  
  ; Ask if user wants to remove application data
  MessageBox MB_YESNO "Uygulama verilerini de silmek istiyor musunuz?" IDNO SkipDataDeletion
    RMDir /r "$LOCALAPPDATA\PersonelYonetimSistemi"
  SkipDataDeletion:
!macroend