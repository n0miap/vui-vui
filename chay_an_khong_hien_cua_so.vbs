Set WshShell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
pythonwPath = "C:\Users\nomiap\AppData\Local\Python\pythoncore-3.14-64\pythonw.exe"

If Not CreateObject("Scripting.FileSystemObject").FileExists(pythonwPath) Then
    pythonwPath = "pythonw"
End If

WshShell.Run """" & pythonwPath & """ """ & scriptDir & "\pinout_server.py""", 0, False

